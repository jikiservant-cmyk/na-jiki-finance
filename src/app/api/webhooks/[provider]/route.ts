import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPaymentProvider, getAvailableProviders } from '@/lib/providers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: providerCode } = await params
    const rawBody = await request.text()
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('signature') || ''

    // 1. Validate provider exists
    if (!getAvailableProviders().includes(providerCode.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // 2. Get provider client
    const providerClient = getPaymentProvider(providerCode)

    // 3. Find provider in DB
    const provider = await db.providers.findFirst({
      where: { code: providerCode.toLowerCase(), is_active: true },
    })
    if (!provider) {
      return NextResponse.json({ error: 'Provider not active' }, { status: 404 })
    }

    // 4. Validate webhook signature
    const isValidSignature = await providerClient.validateWebhookSignature(
      rawBody,
      signature,
      Object.fromEntries(request.headers.entries())
    )

    // 5. Create webhook log (even if invalid signature, for auditing)
    let webhookLog = await db.webhook_logs.create({
      data: {
        provider_id: provider.id,
        payload: rawBody,
        headers: Object.fromEntries(request.headers.entries()),
        signature_valid: isValidSignature,
        processed: false,
      },
    })

    if (!isValidSignature) {
      await db.webhook_logs.update({
        where: { id: webhookLog.id },
        data: { processing_error: 'Invalid signature', processed: true },
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 6. Parse webhook payload
    const body = JSON.parse(rawBody)
    const parsedWebhook = await providerClient.parseWebhookPayload(body)

    // 7. Find payment intent
    const paymentIntent = await db.payment_intents.findFirst({
      where: { reference: parsedWebhook.reference },
      include: { applications: true },
    })

    if (!paymentIntent) {
      await db.webhook_logs.update({
        where: { id: webhookLog.id },
        data: { processing_error: 'Payment not found', processed: true },
      })
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // 8. Wrap everything in a transaction!
    await db.$transaction(async (tx) => {
      // Update payment intent status
      const normalizedStatus = parsedWebhook.status.toLowerCase() as any
      const updateData: any = {
        status: normalizedStatus,
      }
      if (parsedWebhook.providerPaymentId) updateData.provider_payment_id = parsedWebhook.providerPaymentId
      if (parsedWebhook.failureReason) updateData.failure_reason = parsedWebhook.failureReason
      if (normalizedStatus === 'success' || normalizedStatus === 'failed') {
        updateData.completed_at = new Date()
      }
      await tx.payment_intents.update({
        where: { id: paymentIntent.id },
        data: updateData,
      })

      // Create transaction log
      await tx.payment_transactions.create({
        data: {
          payment_intent_id: paymentIntent.id,
          status: normalizedStatus,
          raw_provider_response: rawBody,
          note: 'WEBHOOK_UPDATE',
        },
      })

      // Create internal notification
      if (normalizedStatus === 'success' || normalizedStatus === 'failed') {
        await tx.internal_notifications.create({
          data: {
            payment_intent_id: paymentIntent.id,
            application_id: paymentIntent.application_id,
            url: `${paymentIntent.applications.base_url}${paymentIntent.applications.webhook_path}`,
            payload: {
              paymentIntentId: paymentIntent.id,
              reference: paymentIntent.reference,
              status: normalizedStatus,
              amount: parsedWebhook.amount || paymentIntent.amount,
              currency: parsedWebhook.currency || paymentIntent.currency,
              providerPaymentId: parsedWebhook.providerPaymentId,
              failureReason: parsedWebhook.failureReason,
            },
            status: 'pending',
            attempt_count: 0,
            max_attempts: 5,
            next_retry_at: new Date(),
          },
        })
      }
    })

    // 9. Update webhook log
    await db.webhook_logs.update({
      where: { id: webhookLog.id },
      data: { payment_intent_id: paymentIntent.id, processed: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

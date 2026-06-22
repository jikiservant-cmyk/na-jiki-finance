import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPaymentProvider, getAvailableProviders } from '@/lib/providers'
import { createWebhookLog, updateWebhookLog, createPaymentTransaction } from '@/lib/data'

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
    const provider = await db.provider.findFirst({
      where: { code: providerCode.toLowerCase(), isActive: true },
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
    let webhookLog = await createWebhookLog({
      provider: providerCode,
      eventType: 'WEBHOOK_RECEIVED',
      payload: rawBody,
      signature,
      verified: isValidSignature,
      processed: false,
    })

    if (!isValidSignature) {
      await updateWebhookLog(webhookLog.id, { error: 'Invalid signature', processed: true })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 6. Parse webhook payload
    const body = JSON.parse(rawBody)
    const parsedWebhook = await providerClient.parseWebhookPayload(body)

    // 7. Find payment intent (do this first, outside transaction, to check if it exists)
    const paymentIntent = await db.paymentIntent.findFirst({
      where: { reference: parsedWebhook.reference },
      include: { application: true },
    })

    if (!paymentIntent) {
      await updateWebhookLog(webhookLog.id, { error: 'Payment not found', processed: true })
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // 8. Wrap everything in a transaction to ensure atomicity!
    await db.$transaction(async (tx) => {
      // Update payment intent status
      const normalizedStatus = parsedWebhook.status.toLowerCase()
      const updateData: any = {
        status: normalizedStatus,
      }
      if (parsedWebhook.providerPaymentId) updateData.providerPaymentId = parsedWebhook.providerPaymentId
      if (parsedWebhook.failureReason) updateData.failureReason = parsedWebhook.failureReason
      if (normalizedStatus === 'success' || normalizedStatus === 'failed') {
        updateData.completedAt = new Date()
      }
      await tx.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: updateData,
      })

      // Create transaction log
      await tx.paymentTransaction.create({
        data: {
          paymentIntentId: paymentIntent.id,
          status: normalizedStatus,
          rawProviderResponse: rawBody,
          note: 'WEBHOOK_UPDATE',
        },
      })

      // Create internal notification to notify source app if needed
      if (normalizedStatus === 'success' || normalizedStatus === 'failed') {
        await tx.internalNotification.create({
          data: {
            paymentIntentId: paymentIntent.id,
            applicationId: paymentIntent.applicationId,
            url: `${paymentIntent.application.baseUrl}${paymentIntent.application.webhookPath}`,
            payload: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              reference: paymentIntent.reference,
              status: normalizedStatus,
              amount: parsedWebhook.amount || paymentIntent.amount,
              currency: parsedWebhook.currency || paymentIntent.currency,
              providerPaymentId: parsedWebhook.providerPaymentId,
              failureReason: parsedWebhook.failureReason,
            }),
            status: 'pending',
            attemptCount: 0,
            maxAttempts: 5,
            nextRetryAt: new Date(),
          },
        })
      }
    })

    // 9. Update webhook log to mark as processed
    await updateWebhookLog(webhookLog.id, { paymentId: paymentIntent.id, processed: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

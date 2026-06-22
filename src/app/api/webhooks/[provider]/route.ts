import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPaymentProvider, getAvailableProviders } from '@/lib/providers'
import { updatePaymentStatus, createWebhookLog, updateWebhookLog, createPaymentTransaction } from '@/lib/data'

export async function POST(
  request: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider: providerCode } = params
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
    const webhookLog = await createWebhookLog({
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

    // 7. Find payment intent
    const paymentIntent = await db.paymentIntent.findFirst({
      where: { reference: parsedWebhook.reference },
      include: { application: true },
    })

    if (!paymentIntent) {
      await updateWebhookLog(webhookLog.id, { error: 'Payment not found', processed: true })
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // 8. Update payment intent status
    await updatePaymentStatus(
      parsedWebhook.reference,
      parsedWebhook.status,
      parsedWebhook.providerPaymentId,
      parsedWebhook.failureReason
    )

    // 9. Create transaction log
    await createPaymentTransaction({
      paymentId: paymentIntent.id,
      type: 'WEBHOOK_UPDATE',
      status: parsedWebhook.status,
      amount: parsedWebhook.amount || paymentIntent.amount,
      metadata: rawBody,
    })

    // 10. Update webhook log
    await updateWebhookLog(webhookLog.id, { paymentId: paymentIntent.id, processed: true })

    // 11. Create internal notification to notify source app
    if (parsedWebhook.status === 'success' || parsedWebhook.status === 'failed') {
      await db.internalNotification.create({
        data: {
          paymentIntentId: paymentIntent.id,
          applicationId: paymentIntent.applicationId,
          url: `${paymentIntent.application.baseUrl}${paymentIntent.application.webhookPath}`,
          payload: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            reference: paymentIntent.reference,
            status: parsedWebhook.status,
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

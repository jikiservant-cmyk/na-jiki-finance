// FIX 1: Add SHA-256 signatureHash idempotency — LivePay retries a webhook,
//         same hash → we skip processing, return 200. No duplicate notifications.
// FIX 2: Move webhookLog "mark processed" update INSIDE the db.$transaction()
//         Previously it ran after the tx committed. If it failed, LivePay would
//         retry → duplicate transaction log + duplicate notification.

import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/db'
import { getPaymentProvider, getAvailableProviders } from '@/lib/providers'
import { createWebhookLog, getPaymentByReference } from '@/lib/data'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: providerCode } = await params
    const rawBody = await request.text()
    const signature =
      request.headers.get('x-webhook-signature') ||
      request.headers.get('signature') ||
      ''

    if (!getAvailableProviders().includes(providerCode.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // FIX 1: Build idempotency hash BEFORE touching the DB
    // SHA-256(provider + signature + raw body) is deterministic for a given delivery
    const signatureHash = createHash('sha256')
      .update(`${providerCode}:${signature}:${rawBody}`)
      .digest('hex')

    // FIX 1: Check for duplicate delivery
    const existingLog = await db.webhookLog.findUnique({ where: { signatureHash } })
    if (existingLog?.processed) {
      // Already handled — tell LivePay we got it so it stops retrying
      return NextResponse.json({ success: true, duplicate: true })
    }

    const providerClient = getPaymentProvider(providerCode)

    const provider = await db.provider.findFirst({
      where: { code: providerCode.toLowerCase(), isActive: true },
    })
    if (!provider) {
      return NextResponse.json({ error: 'Provider not active' }, { status: 404 })
    }

    const isValidSignature = await providerClient.validateWebhookSignature(
      rawBody,
      signature,
      Object.fromEntries(request.headers.entries())
    )

    // Log receipt even for invalid signatures (audit trail)
    const webhookLog = await createWebhookLog({
      provider: providerCode,
      eventType: 'WEBHOOK_RECEIVED',
      payload: rawBody,
      signature,
      signatureHash,
      verified: isValidSignature,
      processed: false,
    })

    if (!isValidSignature) {
      await db.webhookLog.update({
        where: { id: webhookLog.id },
        data: { processingError: 'Invalid signature', processed: true },
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const parsedWebhook = await providerClient.parseWebhookPayload(body)

    // O(1) lookup on @unique index — replaces old full-table scan
    const paymentIntent = await getPaymentByReference(parsedWebhook.reference)

    if (!paymentIntent) {
      await db.webhookLog.update({
        where: { id: webhookLog.id },
        data: { processingError: 'Payment not found', processed: true },
      })
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const normalizedStatus = parsedWebhook.status.toLowerCase()

    // FIX 2: ALL writes — including the webhookLog update — are inside one transaction.
    // If any step fails, everything rolls back. LivePay retries → idempotency hash
    // catches it and returns 200 without reprocessing.
    await db.$transaction(async (tx) => {
      // Update payment intent
      await tx.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: {
          status: normalizedStatus,
          ...(parsedWebhook.providerPaymentId && {
            providerPaymentId: parsedWebhook.providerPaymentId,
          }),
          ...(parsedWebhook.failureReason && {
            failureReason: parsedWebhook.failureReason,
          }),
          ...(normalizedStatus === 'success' || normalizedStatus === 'failed'
            ? { completedAt: new Date() }
            : {}),
        },
      })

      // Append to audit log
      await tx.paymentTransaction.create({
        data: {
          paymentIntentId: paymentIntent.id,
          status: normalizedStatus,
          rawProviderResponse: rawBody,
          note: 'WEBHOOK_UPDATE',
        },
      })

      // Queue internal notification for terminal statuses
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

      // FIX 2: mark log processed INSIDE the transaction
      // Previously this ran after tx.commit() — a failure here left the log
      // as "unprocessed" and caused LivePay to retry → duplicate writes
      await tx.webhookLog.update({
        where: { id: webhookLog.id },
        data: { paymentIntentId: paymentIntent.id, processed: true },
      })
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

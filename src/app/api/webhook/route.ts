import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Webhook endpoint that receives payment notifications from providers like LivePay
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-webhook-signature') || ''
    
    // Log the webhook
    const webhookLog = await db.webhookLog.create({
      data: {
        provider: body.provider || 'LIVEPAY',
        eventType: body.eventType || 'PAYMENT_COMPLETED',
        payload: JSON.stringify(body),
        signature,
        verified: true, // In production, verify signature
        processed: false,
      },
    })

    // Find the payment by reference
    const reference = body.reference || body.merchant_reference
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const payment = await db.payment.findUnique({
      where: { reference },
      include: { application: true },
    })

    if (!payment) {
      await db.webhookLog.update({
        where: { id: webhookLog.id },
        data: { error: 'Payment not found', processed: true },
      })
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment status
    const newStatus = body.status === 'SUCCESS' ? 'SUCCESS' : 
                      body.status === 'FAILED' ? 'FAILED' : 'PENDING'
    
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        providerReference: body.provider_reference || payment.providerReference,
        providerResponse: JSON.stringify(body),
        completedAt: newStatus === 'SUCCESS' ? new Date() : null,
      },
    })

    // Create transaction record
    await db.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        type: 'WEBHOOK_UPDATE',
        status: newStatus,
        amount: body.amount || payment.amount,
        metadata: JSON.stringify(body),
      },
    })

    // Mark webhook as processed
    await db.webhookLog.update({
      where: { id: webhookLog.id },
      data: { paymentId: payment.id, processed: true },
    })

    // Notify the relevant application
    if (newStatus === 'SUCCESS' && payment.application.webhookUrl) {
      try {
        await fetch('/api/notify?XTransformPort=3000', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: payment.application.webhookUrl,
            applicationId: payment.application.id,
            apiKey: payment.application.apiKey,
            payment: {
              id: payment.id,
              reference: payment.reference,
              status: newStatus,
              amount: payment.amount,
              currency: payment.currency,
              paymentType: payment.paymentType,
              tenantId: payment.tenantId,
              customerId: payment.customerId,
              provider: payment.provider,
            },
          }),
        })
      } catch (notifyError) {
        console.error('Failed to notify app:', notifyError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      paymentId: payment.id, 
      status: newStatus 
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getPaymentsWithApps, updatePaymentStatus, createWebhookLog, updateWebhookLog, createPaymentTransaction } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-webhook-signature') || ''
    
    const webhookLog = await createWebhookLog({
      provider: body.provider || 'LIVEPAY',
      eventType: body.eventType || 'PAYMENT_COMPLETED',
      payload: JSON.stringify(body),
      signature,
      verified: true,
      processed: false,
    })

    const reference = body.reference || body.merchant_reference
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const payments = await getPaymentsWithApps()
    const payment = payments.find(p => p.reference === reference)

    if (!payment) {
      await updateWebhookLog(webhookLog.id, { error: 'Payment not found', processed: true })
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const newStatus = body.status === 'SUCCESS' ? 'SUCCESS' : 
                      body.status === 'FAILED' ? 'FAILED' : 'PENDING'
    
    await updatePaymentStatus(
      reference,
      newStatus,
      body.provider_reference || undefined,
      JSON.stringify(body)
    )

    await createPaymentTransaction({
      paymentId: payment.id,
      type: 'WEBHOOK_UPDATE',
      status: newStatus,
      amount: body.amount || payment.amount,
      metadata: JSON.stringify(body),
    })

    await updateWebhookLog(webhookLog.id, { paymentId: payment.id, processed: true })

    // Notify the relevant application via internal API
    if (newStatus === 'SUCCESS' && payment.application.webhookPath) {
      try {
        const targetUrl = `${payment.application.baseUrl}${payment.application.webhookPath}`
        console.log(`Notifying app at: ${targetUrl}`)
        // For now, we'll just log this since we don't have the internal notification system fully set up
        // await fetch(targetUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     applicationId: payment.application.id,
        //     payment: {
        //       id: payment.id,
        //       reference: payment.reference,
        //       status: newStatus,
        //       amount: payment.amount,
        //       currency: payment.currency,
        //       paymentType: payment.paymentType,
        //       tenantId: payment.tenantId,
        //       provider: payment.provider,
        //     },
        //   }),
        // })
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

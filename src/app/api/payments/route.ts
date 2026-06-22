import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPaymentProvider } from '@/lib/providers'
import { CreatePaymentRequestSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  try {
    // 1. Parse and validate request body
    const rawBody = await request.json()
    const validatedBody = CreatePaymentRequestSchema.parse(rawBody)

    // 2. Find application by code
    const application = await db.applications.findFirst({
      where: { code: validatedBody.applicationCode, is_active: true },
    })
    if (!application) {
      return NextResponse.json({ error: 'Invalid or inactive application' }, { status: 404 })
    }

    // 3. Find tenant (optional) - using tenantCode as the UUID id
    let tenant: Awaited<ReturnType<typeof db.tenants.findFirst>> = null
    if (validatedBody.tenantCode) {
      tenant = await db.tenants.findFirst({
        where: { 
          id: validatedBody.tenantCode, // tenantCode is the UUID
          app_type: validatedBody.applicationCode // app_type should match application code
        },
      })
      if (!tenant) {
        return NextResponse.json({ error: 'Invalid or inactive tenant' }, { status: 404 })
      }
    }

    // 4. Find payment type (optional)
    let paymentType: Awaited<ReturnType<typeof db.payment_types.findFirst>> = null
    if (validatedBody.paymentTypeCode) {
      paymentType = await db.payment_types.findFirst({
        where: { application_id: application.id, code: validatedBody.paymentTypeCode },
      })
    }

    // 5. Find first active provider
    let provider: Awaited<ReturnType<typeof db.providers.findFirst>> = null
    provider = await db.providers.findFirst({
      where: { is_active: true },
    })
    if (!provider) {
      return NextResponse.json({ error: 'No active payment provider available' }, { status: 500 })
    }

    // 6. Check idempotency key to prevent duplicate payments
    const existingIntent = await db.payment_intents.findFirst({
      where: { idempotency_key: validatedBody.idempotencyKey },
    })
    if (existingIntent) {
      return NextResponse.json({
        paymentId: existingIntent.id,
        reference: existingIntent.reference,
        status: existingIntent.status,
      })
    }

    // 7. Generate reference
    const reference = `${validatedBody.applicationCode.toUpperCase()}-${(validatedBody.paymentTypeCode || 'PAY').toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    // 8. Create payment intent in DB
    const paymentIntent = await db.payment_intents.create({
      data: {
        application_id: application.id,
        tenant_id: tenant?.id || null,
        payment_type_id: paymentType?.id || null,
        external_entity_id: validatedBody.externalEntityId,
        reference,
        idempotency_key: validatedBody.idempotencyKey,
        amount: validatedBody.amount,
        currency: validatedBody.currency,
        phone_number: validatedBody.phoneNumber,
        provider_id: provider.id,
        status: 'pending',
        metadata: validatedBody.metadata || {},
      },
      include: {
        applications: true,
        tenants: true,
        providers: true,
      },
    })

    // 9. Initiate payment with provider
    const providerClient = getPaymentProvider(provider.code)
    const providerResponse = await providerClient.initiatePayment({
      amount: validatedBody.amount,
      currency: validatedBody.currency,
      phoneNumber: validatedBody.phoneNumber,
      reference,
      description: `Payment for ${validatedBody.paymentTypeCode || 'payment'}`,
      metadata: { ...(validatedBody.metadata || {}), paymentIntentId: paymentIntent.id },
    })

    // 10. Update payment intent with provider response
    const updatedIntent = await db.payment_intents.update({
      where: { id: paymentIntent.id },
      data: {
        status: providerResponse.status,
        provider_payment_id: providerResponse.providerPaymentId,
        failure_reason: providerResponse.failureReason,
        completed_at: providerResponse.status === 'success' ? new Date() : null,
      },
    })

    // 11. Create transaction log
    await db.payment_transactions.create({
      data: {
        payment_intent_id: paymentIntent.id,
        status: providerResponse.status,
        raw_provider_response: providerResponse,
        note: 'PAYMENT_INITIATED',
      },
    })

    // 12. Return response to application
    return NextResponse.json({
      paymentId: updatedIntent.id,
      reference: updatedIntent.reference,
      status: updatedIntent.status,
    })
  } catch (error) {
    console.error('Create payment error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

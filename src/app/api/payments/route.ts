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
    const application = await db.application.findFirst({
      where: { code: validatedBody.applicationCode, isActive: true },
    })
    if (!application) {
      return NextResponse.json({ error: 'Invalid or inactive application' }, { status: 404 })
    }

    // 3. Find tenant (optional) - using tenantCode
    let tenant: Awaited<ReturnType<typeof db.tenant.findFirst>> = null
    if (validatedBody.tenantCode) {
      tenant = await db.tenant.findFirst({
        where: { 
          applicationId: application.id,
          code: validatedBody.tenantCode,
          appType: validatedBody.applicationCode,
          isActive: true
        },
      })
      if (!tenant) {
        return NextResponse.json({ error: 'Invalid or inactive tenant' }, { status: 404 })
      }
    }

    // 4. Find payment type (optional)
    let paymentType: Awaited<ReturnType<typeof db.paymentType.findFirst>> = null
    if (validatedBody.paymentTypeCode) {
      paymentType = await db.paymentType.findFirst({
        where: { applicationId: application.id, code: validatedBody.paymentTypeCode },
      })
    }

    // 5. Find first active provider
    let provider: Awaited<ReturnType<typeof db.provider.findFirst>> = null
    provider = await db.provider.findFirst({
      where: { isActive: true },
    })
    if (!provider) {
      return NextResponse.json({ error: 'No active payment provider available' }, { status: 500 })
    }

    // 6. Check idempotency key to prevent duplicate payments
    const existingIntent = await db.paymentIntent.findFirst({
      where: { idempotencyKey: validatedBody.idempotencyKey },
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
    const paymentIntent = await db.paymentIntent.create({
      data: {
        applicationId: application.id,
        tenantId: tenant?.id || null,
        paymentTypeId: paymentType?.id || null,
        externalEntityId: validatedBody.externalEntityId,
        reference,
        idempotencyKey: validatedBody.idempotencyKey,
        amount: validatedBody.amount,
        currency: validatedBody.currency,
        phoneNumber: validatedBody.phoneNumber,
        providerId: provider.id,
        status: 'pending',
        metadata: (validatedBody.metadata || {}) as any,
      },
      include: {
        application: true,
        tenant: true,
        provider: true,
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
    const updatedIntent = await db.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: providerResponse.status,
        providerPaymentId: providerResponse.providerPaymentId,
        failureReason: providerResponse.failureReason,
        completedAt: providerResponse.status === 'success' ? new Date() : null,
      },
    })

    // 11. Create transaction log
    await db.paymentTransaction.create({
      data: {
        paymentIntentId: paymentIntent.id,
        status: providerResponse.status,
        rawProviderResponse: providerResponse as any,
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

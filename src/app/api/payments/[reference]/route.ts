import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params

    // FIX 1: `appType` doesn't exist on Tenant — field is `code`
    // FIX 2: findUnique (not findFirst) — reference is @unique, hits index directly
    const paymentIntent = await db.paymentIntent.findUnique({
      where: { reference },
      include: {
        application: { select: { id: true, code: true, name: true } },
        tenant:      { select: { id: true, code: true, name: true } },
        provider:    { select: { id: true, code: true, name: true } },
        paymentType: { select: { id: true, code: true, description: true } },
      },
    })

    if (!paymentIntent) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({
      id:               paymentIntent.id,
      reference:        paymentIntent.reference,
      status:           paymentIntent.status,
      amount:           Number(paymentIntent.amount), // Decimal → number for JSON
      currency:         paymentIntent.currency,
      phoneNumber:      paymentIntent.phoneNumber,
      externalEntityId: paymentIntent.externalEntityId,
      provider:         paymentIntent.provider,
      providerPaymentId: paymentIntent.providerPaymentId,
      application:      paymentIntent.application,
      tenant:           paymentIntent.tenant,
      paymentType:      paymentIntent.paymentType,
      failureReason:    paymentIntent.failureReason,
      createdAt:        paymentIntent.createdAt,
      updatedAt:        paymentIntent.updatedAt,
      completedAt:      paymentIntent.completedAt,
    })
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

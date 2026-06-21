import { NextResponse } from 'next/server'

// Internal notification service - forwards payment updates to connected applications
export async function POST(request: Request) {
  try {
    const { targetUrl, apiKey, payment } = await request.json()

    if (!targetUrl || !payment) {
      return NextResponse.json({ error: 'Missing target URL or payment data' }, { status: 400 })
    }

    // Forward the payment notification to the target application
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || process.env.INTERNAL_SECRET || 'default-secret'}`,
      },
      body: JSON.stringify(payment),
    })

    if (!response.ok) {
      console.error(`Failed to notify ${targetUrl}: ${response.status}`)
      return NextResponse.json({ 
        error: 'Notification failed', 
        status: response.status 
      }, { status: 502 })
    }

    return NextResponse.json({ 
      success: true, 
      notified: targetUrl,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}

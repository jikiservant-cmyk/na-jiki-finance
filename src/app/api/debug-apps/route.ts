import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const applications = await db.application.findMany({
      include: {
        tenants: true,
        paymentTypes: true,
      },
    })
    return NextResponse.json({ applications })
  } catch (error) {
    console.error('List apps error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

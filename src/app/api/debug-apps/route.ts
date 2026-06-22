import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const apps = await db.application.findMany({
      where: { isActive: true },
      include: {
        tenants: { where: { isActive: true } },
        paymentTypes: true,
      },
    })

    const providers = await db.provider.findMany({
      where: { isActive: true },
    })

    return NextResponse.json({
      applications: apps.map(app => ({
        code: app.code,
        name: app.name,
        baseUrl: app.baseUrl,
        tenants: app.tenants.map(t => ({ code: t.code, name: t.name })),
        paymentTypes: app.paymentTypes.map(pt => ({ code: pt.code, description: pt.description })),
      })),
      providers: providers.map(p => ({ code: p.code, name: p.name })),
    })
  } catch (error) {
    console.error('Debug apps error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

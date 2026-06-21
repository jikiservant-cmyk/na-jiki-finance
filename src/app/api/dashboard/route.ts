import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payments = await db.payment.findMany({
      include: { application: true },
      orderBy: { createdAt: 'desc' },
    })

    const totalRevenue = payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0)

    const revenueByApp = await db.payment.findMany({
      where: { status: 'SUCCESS' },
      include: { application: true },
    })

    const appRevenue: Record<string, { name: string; displayName: string; revenue: number; count: number }> = {}
    for (const p of revenueByApp) {
      const key = p.application.name
      if (!appRevenue[key]) {
        appRevenue[key] = { name: key, displayName: p.application.displayName, revenue: 0, count: 0 }
      }
      appRevenue[key].revenue += p.amount
      appRevenue[key].count += 1
    }

    const statusCounts = {
      success: payments.filter(p => p.status === 'SUCCESS').length,
      pending: payments.filter(p => p.status === 'PENDING').length,
      failed: payments.filter(p => p.status === 'FAILED').length,
    }

    const successRate = payments.length > 0 
      ? ((statusCounts.success / payments.length) * 100).toFixed(1)
      : '0'

    const providerRevenue: Record<string, { provider: string; revenue: number; count: number }> = {}
    for (const p of revenueByApp) {
      const key = p.provider || 'UNKNOWN'
      if (!providerRevenue[key]) {
        providerRevenue[key] = { provider: key, revenue: 0, count: 0 }
      }
      providerRevenue[key].revenue += p.amount
      providerRevenue[key].count += 1
    }

    const dailyRevenue: { date: string; revenue: number; count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayStart = new Date(dateStr + 'T00:00:00')
      const dayEnd = new Date(dateStr + 'T23:59:59')
      
      const dayPayments = revenueByApp.filter(p => 
        p.completedAt && p.completedAt >= dayStart && p.completedAt <= dayEnd
      )
      
      dailyRevenue.push({
        date: dateStr,
        revenue: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        count: dayPayments.length,
      })
    }

    const recentPayments = payments.slice(0, 20).map(p => ({
      id: p.id,
      reference: p.reference,
      application: p.application.displayName,
      paymentType: p.paymentType,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      createdAt: p.createdAt,
      completedAt: p.completedAt,
    }))

    return NextResponse.json({
      totalRevenue,
      appRevenue: Object.values(appRevenue),
      statusCounts,
      successRate,
      providerRevenue: Object.values(providerRevenue),
      dailyRevenue,
      recentPayments,
      totalPayments: payments.length,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

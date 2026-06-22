// Database abstraction layer
// Uses Supabase when configured, falls back to Prisma (SQLite) for local dev

import { supabaseAdmin, isSupabaseConfigured } from './supabase'
import { db } from './db'

// ===== DASHBOARD AGGREGATE DATA =====

export async function getDashboardData() {
  // 1. Get total counts and revenue (fast, uses SQL aggregates)
  const [
    totalPayments,
    totalRevenueData,
    statusCountData,
    appRevenueData,
    providerRevenueData,
    recentIntents,
    notificationsData
  ] = await Promise.all([
    db.paymentIntent.count(),
    db.paymentIntent.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    }),
    db.paymentIntent.groupBy({
      by: ['status'],
      _count: true
    }),
    db.paymentIntent.groupBy({
      by: ['applicationId'],
      where: { status: 'success' },
      _sum: { amount: true },
      _count: true
    }),
    db.paymentIntent.groupBy({
      by: ['providerId'],
      where: { status: 'success' },
      _sum: { amount: true },
      _count: true
    }),
    db.paymentIntent.findMany({
      include: {
        application: true,
        tenant: true,
        provider: true,
        paymentType: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    }),
    db.internalNotification.groupBy({
      by: ['status'],
      _count: true
    })
  ])

  const totalRevenue = totalRevenueData._sum.amount || 0

  // 2. Format status counts
  const statusCounts: Record<string, number> = {
    success: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    expired: 0,
    cancelled: 0,
  }
  for (const item of statusCountData) {
    statusCounts[item.status] = item._count
  }

  const successRate = totalPayments > 0
    ? ((statusCounts.success / totalPayments) * 100).toFixed(1)
    : '0'

  // 3. Revenue by application (fetch app details)
  const appIds = appRevenueData.map(i => i.applicationId)
  const apps = await db.application.findMany({
    where: { id: { in: appIds } }
  })
  const appMap = new Map(apps.map(a => [a.id, a]))

  const appRevenue = appRevenueData.map(i => ({
    code: appMap.get(i.applicationId)?.code || 'unknown',
    name: appMap.get(i.applicationId)?.name || 'Unknown',
    revenue: i._sum.amount || 0,
    count: i._count,
    successCount: i._count
  }))

  // 4. Revenue by provider (fetch provider details)
  const providerIds = providerRevenueData.map(i => i.providerId)
  const providers = await db.provider.findMany({
    where: { id: { in: providerIds } }
  })
  const providerMap = new Map(providers.map(p => [p.id, p]))

  const providerRevenue = providerRevenueData.map(i => ({
    code: providerMap.get(i.providerId)?.code || 'unknown',
    name: providerMap.get(i.providerId)?.name || 'Unknown',
    revenue: i._sum.amount || 0,
    count: i._count
  }))

  // 5. Revenue by tenant (we'll do this with a groupBy including tenant)
  const tenantRevenueData = await db.paymentIntent.groupBy({
    by: ['tenantId', 'applicationId'],
    where: { status: 'success', tenantId: { not: null } },
    _sum: { amount: true },
    _count: true
  })
  const tenantIds = tenantRevenueData.map(i => i.tenantId!).filter(Boolean)
  const tenants = await db.tenant.findMany({
    where: { id: { in: tenantIds } },
  })
  const tenantMap = new Map(tenants.map(t => [t.id, t]))

  const tenantRevenue = tenantRevenueData.map(i => {
    const tenant = tenantMap.get(i.tenantId!)
    return {
      appType: tenant?.appType || 'unknown',
      name: tenant?.name || 'Unknown',
      revenue: i._sum.amount || 0,
      count: i._count
    }
  })

  // 6. Daily revenue (14 days)
  const dailyRevenue: { date: string; revenue: number; count: number; failed: number }[] = []
  for (let d = 13; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const dateStr = date.toISOString().split('T')[0]
    const dayStart = new Date(dateStr + 'T00:00:00')
    const dayEnd = new Date(dateStr + 'T23:59:59')

    const [daySuccess, dayFailed] = await Promise.all([
      db.paymentIntent.aggregate({
        where: {
          status: 'success',
          completedAt: { gte: dayStart, lte: dayEnd }
        },
        _sum: { amount: true },
        _count: true
      }),
      db.paymentIntent.count({
        where: {
          status: 'failed',
          createdAt: { gte: dayStart, lte: dayEnd }
        }
      })
    ])

    dailyRevenue.push({
      date: dateStr,
      revenue: daySuccess._sum.amount ? Number(daySuccess._sum.amount) : 0,
      count: daySuccess._count,
      failed: dayFailed
    })
  }

  // 7. Payment funnel
  const appFunnelData = await db.paymentIntent.groupBy({
    by: ['applicationId', 'status'],
    _count: true
  })
  const funnel: Record<string, { application: string; total: number; success: number; failed: number; inFlight: number; rate: string }> = {}
  for (const item of appFunnelData) {
    const app = appMap.get(item.applicationId)
    if (!app) continue
    const key = app.code
    if (!funnel[key]) {
      funnel[key] = {
        application: app.name,
        total: 0,
        success: 0,
        failed: 0,
        inFlight: 0,
        rate: '0'
      }
    }
    funnel[key].total += item._count
    if (item.status === 'success') funnel[key].success += item._count
    if (item.status === 'failed') funnel[key].failed += item._count
    if (item.status === 'pending' || item.status === 'processing') funnel[key].inFlight += item._count
  }
  for (const key of Object.keys(funnel)) {
    const f = funnel[key]
    f.rate = f.total > 0 ? ((f.success / f.total) * 100).toFixed(1) : '0'
  }

  // 8. Recent intents format
  const recentIntentsFormatted = recentIntents.map(i => ({
    id: i.id,
    reference: i.reference,
    application: i.application.name,
    applicationCode: i.application.code,
    tenantName: i.tenant?.name || null,
    tenantAppType: i.tenant?.appType || null,
    paymentType: i.paymentType?.code || null,
    amount: i.amount,
    currency: i.currency,
    status: i.status,
    provider: i.provider.name,
    providerCode: i.provider.code,
    phoneNumber: i.phoneNumber,
    externalEntityId: i.externalEntityId,
    failureReason: i.failureReason,
    createdAt: i.createdAt,
    completedAt: i.completedAt,
  }))

  // 9. Notification stats
  const notifStats = {
    total: 0,
    delivered: 0,
    pending: 0,
    retrying: 0,
    exhausted: 0,
  }
  for (const item of notificationsData) {
    notifStats.total += item._count
    if (item.status === 'delivered') notifStats.delivered = item._count
    if (item.status === 'pending') notifStats.pending = item._count
    if (item.status === 'failed_retrying') notifStats.retrying = item._count
    if (item.status === 'failed_exhausted') notifStats.exhausted = item._count
  }

  return {
    totalRevenue,
    statusCounts,
    successRate,
    appRevenue,
    providerRevenue,
    tenantRevenue,
    dailyRevenue,
    funnel: Object.values(funnel),
    recentIntents: recentIntentsFormatted,
    totalPayments,
    notifStats,
  }
}

// ===== WEBHOOK LOGS =====

export async function getWebhookLogsData(limit = 50) {
  const logs = await db.webhookLog.findMany({
    include: {
      provider: true,
      paymentIntent: { select: { reference: true, amount: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return logs.map(l => ({
    id: l.id,
    providerId: l.providerId,
    providerCode: l.provider.code,
    providerName: l.provider.name,
    paymentIntentId: l.paymentIntentId,
    payload: l.payload,
    headers: l.headers,
    signatureValid: l.signatureValid,
    processed: l.processed,
    processingError: l.processingError,
    createdAt: l.createdAt,
    payment: l.paymentIntent ? {
      reference: l.paymentIntent.reference,
      amount: l.paymentIntent.amount,
      status: l.paymentIntent.status,
    } : null,
  }))
}

// ===== NOTIFICATIONS =====

export async function getPendingNotifications() {
  return db.internalNotification.findMany({
    where: { status: { in: ['pending', 'failed_retrying'] } },
    include: { paymentIntent: { include: { application: true } }, application: true },
    orderBy: { createdAt: 'asc' },
  })
}

// ===== PAYMENT HELPERS (for webhook processing) =====

export async function getPaymentByReference(reference: string) {
  return db.paymentIntent.findFirst({
    where: { reference },
    include: {
      application: true,
      tenant: true,
      provider: true,
      paymentType: true,
    },
  })
}

export async function getPaymentsWithApps() {
  return db.paymentIntent.findMany({
    include: {
      application: true,
      tenant: true,
      provider: true,
      paymentType: true,
    },
  })
}

export async function updatePaymentStatus(
  reference: string,
  status: string,
  externalRef?: string,
  metadata?: string
) {
  const normalizedStatus = status.toLowerCase() as any
  const updateData: Record<string, unknown> = {
    status: normalizedStatus,
  }
  if (externalRef) updateData.externalEntityId = externalRef
  if (normalizedStatus === 'success' || normalizedStatus === 'failed') {
    updateData.completedAt = new Date()
  }
  if (metadata) updateData.failureReason = metadata

  return db.paymentIntent.updateMany({
    where: { reference },
    data: updateData,
  })
}

export async function createWebhookLog(data: {
  provider: string
  eventType: string
  payload: string
  signature: string
  verified: boolean
  processed: boolean
}) {
  // Find provider by code — fallback to first active provider if not found
  let provider = await db.provider.findFirst({ where: { code: data.provider.toLowerCase() } })
  if (!provider) {
    provider = await db.provider.findFirst({ where: { isActive: true } })
  }
  if (!provider) {
    throw new Error(`No provider found for webhook: ${data.provider}`)
  }

  return db.webhookLog.create({
    data: {
      payload: data.payload,
      headers: JSON.stringify({ signature: data.signature, eventType: data.eventType }),
      signatureValid: data.verified,
      processed: data.processed,
      providerId: provider.id,
    },
  })
}

export async function updateWebhookLog(
  id: string,
  data: { paymentId?: string; error?: string; processed?: boolean }
) {
  const updateData: Record<string, unknown> = {}
  if (data.paymentId) updateData.paymentIntentId = data.paymentId
  if (data.error) updateData.processingError = data.error
  if (data.processed !== undefined) updateData.processed = data.processed

  return db.webhookLog.update({
    where: { id },
    data: updateData,
  })
}

export async function createPaymentTransaction(data: {
  paymentId: string
  type: string
  status: string
  amount: number
  metadata: string
}) {
  return db.paymentTransaction.create({
    data: {
      paymentIntentId: data.paymentId,
      status: data.status.toLowerCase() as any,
      rawProviderResponse: data.metadata,
      note: data.type,
    },
  })
}

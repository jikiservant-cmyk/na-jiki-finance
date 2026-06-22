// Database abstraction layer
// Uses Supabase when configured, falls back to Prisma (SQLite) for local dev

import { supabaseAdmin, isSupabaseConfigured } from './supabase'
import { db } from './db'

// ===== DASHBOARD AGGREGATE DATA =====

export async function getDashboardData() {
  // Get all payment intents with relations
  const intents = await db.paymentIntent.findMany({
    include: {
      application: true,
      tenant: true,
      provider: true,
      paymentType: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalRevenue = intents
    .filter(i => i.status === 'success')
    .reduce((sum, i) => sum + i.amount, 0)

  const statusCounts = {
    success: intents.filter(i => i.status === 'success').length,
    pending: intents.filter(i => i.status === 'pending').length,
    processing: intents.filter(i => i.status === 'processing').length,
    failed: intents.filter(i => i.status === 'failed').length,
    expired: intents.filter(i => i.status === 'expired').length,
    cancelled: intents.filter(i => i.status === 'cancelled').length,
  }

  const successRate = intents.length > 0
    ? ((statusCounts.success / intents.length) * 100).toFixed(1)
    : '0'

  // Revenue by application
  const appRevenue: Record<string, { code: string; name: string; revenue: number; count: number; successCount: number }> = {}
  for (const i of intents.filter(i => i.status === 'success')) {
    const key = i.application.code
    if (!appRevenue[key]) {
      appRevenue[key] = { code: key, name: i.application.name, revenue: 0, count: 0, successCount: 0 }
    }
    appRevenue[key].revenue += i.amount
    appRevenue[key].successCount += 1
  }
  for (const i of intents) {
    const key = i.application.code
    if (appRevenue[key]) appRevenue[key].count += 1
  }

  // Revenue by provider
  const providerRevenue: Record<string, { code: string; name: string; revenue: number; count: number }> = {}
  for (const i of intents.filter(i => i.status === 'success')) {
    const key = i.provider.code
    if (!providerRevenue[key]) {
      providerRevenue[key] = { code: key, name: i.provider.name, revenue: 0, count: 0 }
    }
    providerRevenue[key].revenue += i.amount
    providerRevenue[key].count += 1
  }

  // Revenue by tenant
  const tenantRevenue: Record<string, { code: string; name: string; application: string; revenue: number; count: number }> = {}
  for (const i of intents.filter(i => i.status === 'success' && i.tenant)) {
    const key = i.tenant!.code
    if (!tenantRevenue[key]) {
      tenantRevenue[key] = { code: key, name: i.tenant!.name, application: i.application.code, revenue: 0, count: 0 }
    }
    tenantRevenue[key].revenue += i.amount
    tenantRevenue[key].count += 1
  }

  // Daily revenue (14 days)
  const dailyRevenue: { date: string; revenue: number; count: number; failed: number }[] = []
  for (let d = 13; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const dateStr = date.toISOString().split('T')[0]
    const dayStart = new Date(dateStr + 'T00:00:00')
    const dayEnd = new Date(dateStr + 'T23:59:59')

    const daySuccess = intents.filter(i => i.status === 'success' && i.completedAt && i.completedAt >= dayStart && i.completedAt <= dayEnd)
    const dayFailed = intents.filter(i => i.status === 'failed' && i.createdAt >= dayStart && i.createdAt <= dayEnd)

    dailyRevenue.push({
      date: dateStr,
      revenue: daySuccess.reduce((s, i) => s + i.amount, 0),
      count: daySuccess.length,
      failed: dayFailed.length,
    })
  }

  // Payment funnel (by application)
  const funnel: Record<string, { application: string; total: number; success: number; failed: number; inFlight: number; rate: string }> = {}
  for (const i of intents) {
    const key = i.application.code
    if (!funnel[key]) funnel[key] = { application: i.application.name, total: 0, success: 0, failed: 0, inFlight: 0, rate: '0' }
    funnel[key].total += 1
    if (i.status === 'success') funnel[key].success += 1
    if (i.status === 'failed') funnel[key].failed += 1
    if (i.status === 'pending' || i.status === 'processing') funnel[key].inFlight += 1
  }
  for (const key of Object.keys(funnel)) {
    const f = funnel[key]
    f.rate = f.total > 0 ? ((f.success / f.total) * 100).toFixed(1) : '0'
  }

  // Recent intents for table
  const recentIntents = intents.slice(0, 30).map(i => ({
    id: i.id,
    reference: i.reference,
    application: i.application.name,
    applicationCode: i.application.code,
    tenantName: i.tenant?.name || null,
    tenantCode: i.tenant?.code || null,
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

  // Notification stats
  const notifications = await db.internalNotification.findMany()
  const notifStats = {
    total: notifications.length,
    delivered: notifications.filter(n => n.status === 'delivered').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    retrying: notifications.filter(n => n.status === 'failed_retrying').length,
    exhausted: notifications.filter(n => n.status === 'failed_exhausted').length,
  }

  return {
    totalRevenue,
    statusCounts,
    successRate,
    appRevenue: Object.values(appRevenue),
    providerRevenue: Object.values(providerRevenue),
    tenantRevenue: Object.values(tenantRevenue),
    dailyRevenue,
    funnel: Object.values(funnel),
    recentIntents,
    totalPayments: intents.length,
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

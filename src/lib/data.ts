// Database abstraction layer
// Uses Supabase when configured, falls back to Prisma (SQLite) for local dev

import { supabaseAdmin, isSupabaseConfigured } from './supabase'
import { db } from './db'

// ===== APPLICATIONS =====

export async function getApplications() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('active', true)
    if (error) throw error
    return data.map(mapApplicationFromSupabase)
  }
  const apps = await db.application.findMany({ where: { active: true } })
  return apps.map(mapApplicationFromPrisma)
}

export async function getApplicationByName(name: string) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('name', name)
      .single()
    if (error) throw error
    return mapApplicationFromSupabase(data)
  }
  const app = await db.application.findUnique({ where: { name } })
  return app ? mapApplicationFromPrisma(app) : null
}

// ===== PAYMENTS =====

export async function getPaymentsWithApps() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, applications(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(mapPaymentWithAppFromSupabase)
  }
  const payments = await db.payment.findMany({
    include: { application: true },
    orderBy: { createdAt: 'desc' },
  })
  return payments.map(mapPaymentWithAppFromPrisma)
}

export async function getSuccessfulPayments() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*, applications(*)')
      .eq('status', 'SUCCESS')
    if (error) throw error
    return data.map(mapPaymentWithAppFromSupabase)
  }
  const payments = await db.payment.findMany({
    where: { status: 'SUCCESS' },
    include: { application: true },
  })
  return payments.map(mapPaymentWithAppFromPrisma)
}

export async function updatePaymentStatus(reference: string, status: string, providerRef?: string, providerResponse?: string) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
    if (providerRef) updateData.provider_reference = providerRef
    if (providerResponse) updateData.provider_response = providerResponse
    if (status === 'SUCCESS') updateData.completed_at = new Date().toISOString()
    const { error } = await supabaseAdmin.from('payments').update(updateData).eq('reference', reference)
    if (error) throw error
    return
  }
  await db.payment.update({
    where: { reference },
    data: {
      status,
      providerReference: providerRef,
      providerResponse,
      completedAt: status === 'SUCCESS' ? new Date() : null,
    },
  })
}

export async function createPayment(payment: {
  reference: string
  applicationId: string
  tenantId?: string
  customerId?: string
  paymentType: string
  amount: number
  currency?: string
  status?: string
  provider?: string
}) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('payments').insert({
      reference: payment.reference,
      application_id: payment.applicationId,
      tenant_id: payment.tenantId,
      customer_id: payment.customerId,
      payment_type: payment.paymentType,
      amount: payment.amount,
      currency: payment.currency || 'UGX',
      status: payment.status || 'PENDING',
      provider: payment.provider,
    }).select().single()
    if (error) throw error
    return data
  }
  return db.payment.create({
    data: {
      reference: payment.reference,
      applicationId: payment.applicationId,
      tenantId: payment.tenantId,
      customerId: payment.customerId,
      paymentType: payment.paymentType,
      amount: payment.amount,
      currency: payment.currency || 'UGX',
      status: payment.status || 'PENDING',
      provider: payment.provider,
    },
  })
}

// ===== WEBHOOK LOGS =====

export async function getWebhookLogs(limit = 50) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('webhook_logs')
      .select('*, payments(reference, amount, status)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data.map(mapWebhookLogFromSupabase)
  }
  const logs = await db.webhookLog.findMany({
    include: { payment: { select: { reference: true, amount: true, status: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return logs.map(mapWebhookLogFromPrisma)
}

export async function createWebhookLog(log: {
  paymentId?: string
  provider: string
  eventType: string
  payload: string
  signature?: string
  verified?: boolean
  processed?: boolean
  error?: string
}) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('webhook_logs').insert({
      payment_id: log.paymentId,
      provider: log.provider,
      event_type: log.eventType,
      payload: log.payload,
      signature: log.signature,
      verified: log.verified ?? true,
      processed: log.processed ?? false,
      error: log.error,
    }).select().single()
    if (error) throw error
    return data
  }
  return db.webhookLog.create({
    data: {
      paymentId: log.paymentId,
      provider: log.provider,
      eventType: log.eventType,
      payload: log.payload,
      signature: log.signature,
      verified: log.verified ?? true,
      processed: log.processed ?? false,
      error: log.error,
    },
  })
}

export async function updateWebhookLog(id: string, data: { paymentId?: string; processed?: boolean; error?: string }) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const updateData: Record<string, unknown> = {}
    if (data.paymentId) updateData.payment_id = data.paymentId
    if (data.processed !== undefined) updateData.processed = data.processed
    if (data.error) updateData.error = data.error
    const { error } = await supabaseAdmin.from('webhook_logs').update(updateData).eq('id', id)
    if (error) throw error
    return
  }
  await db.webhookLog.update({
    where: { id },
    data: { paymentId: data.paymentId, processed: data.processed, error: data.error },
  })
}

// ===== PAYMENT TRANSACTIONS =====

export async function createPaymentTransaction(tx: {
  paymentId: string
  type: string
  status: string
  amount: number
  metadata?: string
}) {
  if (isSupabaseConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin.from('payment_transactions').insert({
      payment_id: tx.paymentId,
      type: tx.type,
      status: tx.status,
      amount: tx.amount,
      metadata: tx.metadata,
    })
    if (error) throw error
    return
  }
  await db.paymentTransaction.create({
    data: { paymentId: tx.paymentId, type: tx.type, status: tx.status, amount: tx.amount, metadata: tx.metadata },
  })
}

// ===== TYPES =====

export interface AppData {
  id: string
  name: string
  displayName: string
  webhookUrl: string | null
  apiKey: string | null
  active: boolean
}

export interface PaymentWithAppData {
  id: string
  reference: string
  applicationId: string
  tenantId: string | null
  customerId: string | null
  paymentType: string
  amount: number
  currency: string
  status: string
  provider: string | null
  providerReference: string | null
  providerResponse: string | null
  completedAt: Date | null
  createdAt: Date
  application: AppData
}

export interface WebhookLogData {
  id: string
  paymentId: string | null
  provider: string
  eventType: string
  payload: string
  signature: string | null
  verified: boolean
  processed: boolean
  error: string | null
  createdAt: Date
  payment?: { reference: string; amount: number; status: string } | null
}

// ===== MAPPERS =====

function mapApplicationFromSupabase(row: Record<string, unknown>): AppData {
  return { id: row.id as string, name: row.name as string, displayName: row.display_name as string, webhookUrl: row.webhook_url as string | null, apiKey: row.api_key as string | null, active: row.active as boolean }
}

function mapApplicationFromPrisma(row: { id: string; name: string; displayName: string; webhookUrl: string | null; apiKey: string | null; active: boolean }): AppData {
  return row
}

function mapPaymentWithAppFromSupabase(row: Record<string, unknown>): PaymentWithAppData {
  const app = row.applications as Record<string, unknown>
  return {
    id: row.id as string, reference: row.reference as string, applicationId: row.application_id as string,
    tenantId: row.tenant_id as string | null, customerId: row.customer_id as string | null,
    paymentType: row.payment_type as string, amount: Number(row.amount), currency: row.currency as string,
    status: row.status as string, provider: row.provider as string | null,
    providerReference: row.provider_reference as string | null, providerResponse: row.provider_response as string | null,
    completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
    createdAt: new Date(row.created_at as string),
    application: app ? mapApplicationFromSupabase(app) : {} as AppData,
  }
}

function mapPaymentWithAppFromPrisma(row: { id: string; reference: string; applicationId: string; tenantId: string | null; customerId: string | null; paymentType: string; amount: number; currency: string; status: string; provider: string | null; providerReference: string | null; providerResponse: string | null; completedAt: Date | null; createdAt: Date; application: { id: string; name: string; displayName: string; webhookUrl: string | null; apiKey: string | null; active: boolean } }): PaymentWithAppData {
  return { ...row, application: mapApplicationFromPrisma(row.application) }
}

function mapWebhookLogFromSupabase(row: Record<string, unknown>): WebhookLogData {
  const payment = row.payments as Record<string, unknown> | null
  return {
    id: row.id as string, paymentId: row.payment_id as string | null,
    provider: row.provider as string, eventType: row.event_type as string,
    payload: typeof row.payload === 'string' ? row.payload : JSON.stringify(row.payload),
    signature: row.signature as string | null, verified: row.verified as boolean,
    processed: row.processed as boolean, error: row.error as string | null,
    createdAt: new Date(row.created_at as string),
    payment: payment ? { reference: payment.reference as string, amount: Number(payment.amount), status: payment.status as string } : null,
  }
}

function mapWebhookLogFromPrisma(row: { id: string; paymentId: string | null; provider: string; eventType: string; payload: string; signature: string | null; verified: boolean; processed: boolean; error: string | null; createdAt: Date; payment?: { reference: string; amount: number; status: string } | null }): WebhookLogData {
  return row
}

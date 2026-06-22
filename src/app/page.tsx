'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Navigation } from '@/components/app/navigation'
import Link from 'next/link'

interface DashboardData {
  totalRevenue: number
  statusCounts: { success: number; pending: number; processing: number; failed: number; expired: number; cancelled: number }
  successRate: string
  appRevenue: { code: string; name: string; revenue: number; count: number; successCount: number }[]
  providerRevenue: { code: string; name: string; revenue: number; count: number }[]
  tenantRevenue: { code: string; name: string; application: string; revenue: number; count: number }[]
  dailyRevenue: { date: string; revenue: number; count: number; failed: number }[]
  funnel: { application: string; total: number; success: number; failed: number; inFlight: number; rate: string }[]
  recentIntents: {
    id: string; reference: string; application: string; applicationCode: string
    tenantName: string | null; tenantCode: string | null; paymentType: string | null
    amount: number; currency: string; status: string; provider: string; providerCode: string
    phoneNumber: string | null; externalEntityId: string | null; failureReason: string | null
    createdAt: string; completedAt: string | null
  }[]
  totalPayments: number
  notifStats: { total: number; delivered: number; pending: number; retrying: number; exhausted: number }
}

const fmt = (n: number) => {
  if (n >= 1000000) return `UGX ${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `UGX ${(n / 1000).toFixed(0)}K`
  return `UGX ${n.toLocaleString()}`
}

const fmtDate = (d: string | Date) => {
  const date = new Date(d)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const appColors: Record<string, string> = { sacco: '#52B788', church: '#F59E0B', school: '#EA580C' }
const provColors: Record<string, string> = { livepay: '#52B788', mtn: '#F59E0B', airtel: '#EF4444', pesapal: '#3B82F6' }
const statusColors: Record<string, string> = { success: 'bg-green-500/10 text-green-400', pending: 'bg-yellow-500/10 text-yellow-400', processing: 'bg-blue-500/10 text-blue-400', failed: 'bg-red-500/10 text-red-400', expired: 'bg-gray-500/10 text-gray-400', cancelled: 'bg-gray-500/10 text-gray-400' }

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="p-4 md:p-5 bg-card border border-foreground/10">
      <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">{label}</span>
      <div className="text-xl md:text-2xl font-black tracking-tight mt-1" style={accent ? { color: accent } : {}}>{value}</div>
      {sub && <span className="text-[10px] font-mono text-foreground/30 mt-1 block">{sub}</span>}
    </div>
  )
}

function MiniBarChart({ data, maxVal, color, failData }: { data: number[]; maxVal: number; color: string; failData?: number[] }) {
  return (
    <div className="space-y-1">
      <div className="flex items-end gap-1 h-20">
        {data.map((v, i) => (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.max(2, (v / maxVal) * 100)}%` }} transition={{ delay: i * 0.03, duration: 0.5 }} className="flex-1 rounded-t-sm min-w-[3px]" style={{ backgroundColor: v > 0 ? color : 'oklch(0.22 0 0)' }} />
        ))}
      </div>
      {failData && (
        <div className="flex items-end gap-1 h-6">
          {failData.map((v, i) => (
            <div key={i} className="flex-1 min-w-[3px] rounded-t-sm" style={{ backgroundColor: v > 0 ? '#EF4444' : 'transparent', height: `${Math.max(v > 0 ? 20 : 0, (v / maxVal) * 100)}%` }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const maxDaily = data ? Math.max(...data.dailyRevenue.map(d => d.revenue), 1) : 1

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-14">
        <div className="px-6 md:px-16 lg:px-24 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Finance HQ</h1>
              <p className="text-sm text-foreground/40 mt-1">Payment Service — multi-app, multi-tenant, multi-provider</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-mono text-foreground/30">All systems operational</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 md:px-16 lg:px-24 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="p-6 bg-card border border-foreground/10 animate-pulse"><div className="h-3 bg-foreground/10 w-20 mb-2" /><div className="h-8 bg-foreground/10 w-32" /></div>)}
          </div>
        ) : data && (
          <div className="px-6 md:px-16 lg:px-24 py-4 space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard label="Total Revenue" value={fmt(data.totalRevenue)} sub={`${data.totalPayments} intents`} accent="oklch(0.97 0.15 70)" />
              <StatCard label="Success Rate" value={`${data.successRate}%`} sub={`${data.statusCounts.success} successful`} accent="#52B788" />
              <StatCard label="Processing" value={String(data.statusCounts.processing)} sub="Awaiting customer" />
              <StatCard label="Pending" value={String(data.statusCounts.pending)} sub="Not yet sent" />
              <StatCard label="Failed" value={String(data.statusCounts.failed)} sub="Needs attention" accent="#EF4444" />
              <StatCard label="Expired" value={String(data.statusCounts.expired)} sub="Timed out" />
            </div>

            {/* Revenue by app + Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Revenue by Application</span>
                <div className="space-y-3 mt-3">
                  {data.appRevenue.map(app => {
                    const pct = data.totalRevenue > 0 ? (app.revenue / data.totalRevenue) * 100 : 0
                    return (
                      <div key={app.code} className="p-4 bg-card border border-foreground/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-foreground/60">{app.name}</h4>
                            <span className="text-2xl font-black" style={{ color: appColors[app.code] || '#fff' }}>{fmt(app.revenue)}</span>
                          </div>
                          <span className="text-[10px] font-mono text-foreground/30">{app.successCount}/{app.count} intents</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-foreground/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className="h-full" style={{ backgroundColor: appColors[app.code] }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Payment Funnel by Application</span>
                <div className="space-y-3 mt-3">
                  {data.funnel.map(f => (
                    <div key={f.application} className="p-4 bg-card border border-foreground/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">{f.application}</span>
                        <span className="text-sm font-black text-green-400">{f.rate}%</span>
                      </div>
                      <div className="flex gap-1 h-6">
                        <div className="bg-green-500/60 rounded-sm flex items-center justify-center" style={{ width: `${(f.success / f.total) * 100}%`, minWidth: f.success > 0 ? 20 : 0 }}>
                          {f.success > 0 && <span className="text-[9px] font-mono text-white">{f.success}</span>}
                        </div>
                        {(f.inFlight > 0) && (
                          <div className="bg-yellow-500/40 rounded-sm flex items-center justify-center" style={{ width: `${(f.inFlight / f.total) * 100}%`, minWidth: f.inFlight > 0 ? 20 : 0 }}>
                            <span className="text-[9px] font-mono text-white">{f.inFlight}</span>
                          </div>
                        )}
                        {(f.failed > 0) && (
                          <div className="bg-red-500/40 rounded-sm flex items-center justify-center" style={{ width: `${(f.failed / f.total) * 100}%`, minWidth: f.failed > 0 ? 20 : 0 }}>
                            <span className="text-[9px] font-mono text-white">{f.failed}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-[9px] font-mono text-foreground/30">
                        <span className="text-green-400/60">success</span>
                        <span className="text-yellow-400/60">in-flight</span>
                        <span className="text-red-400/60">failed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily revenue + Provider revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 md:p-6 bg-card border border-foreground/10">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Daily Revenue — 14 Days</span>
                <MiniBarChart data={data.dailyRevenue.map(d => d.revenue)} maxVal={maxDaily} color="oklch(0.97 0.15 70 / 0.6)" failData={data.dailyRevenue.map(d => d.failed)} />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-mono text-foreground/20">14 days ago</span>
                  <span className="text-[10px] font-mono text-foreground/20">Today</span>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-card border border-foreground/10">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Revenue by Provider</span>
                <div className="space-y-3">
                  {data.providerRevenue.map(p => {
                    const maxP = Math.max(...data.providerRevenue.map(x => x.revenue), 1)
                    return (
                      <div key={p.code}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-mono">{p.name}</span>
                          <span className="text-sm font-mono text-foreground/50">{fmt(p.revenue)}</span>
                        </div>
                        <div className="h-1.5 bg-foreground/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(p.revenue / maxP) * 100}%` }} transition={{ duration: 0.8 }} className="h-full" style={{ backgroundColor: provColors[p.code] || '#fff' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Tenant Revenue + Notification Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 md:p-6 bg-card border border-foreground/10">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Revenue by Tenant</span>
                <div className="space-y-2">
                  {data.tenantRevenue.map(t => (
                    <div key={t.code} className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0">
                      <div>
                        <span className="text-sm font-mono">{t.name}</span>
                        <span className="text-[10px] font-mono text-foreground/20 ml-2">({t.application})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold" style={{ color: appColors[t.application] || '#fff' }}>{fmt(t.revenue)}</span>
                        <span className="text-[10px] font-mono text-foreground/20 ml-2">{t.count} txns</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 md:p-6 bg-card border border-foreground/10">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Internal Notifications</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-foreground/[0.03] border border-foreground/5">
                    <span className="text-[10px] font-mono text-foreground/30">Delivered</span>
                    <div className="text-lg font-black text-green-400">{data.notifStats.delivered}</div>
                  </div>
                  <div className="p-3 bg-foreground/[0.03] border border-foreground/5">
                    <span className="text-[10px] font-mono text-foreground/30">Pending</span>
                    <div className="text-lg font-black text-yellow-400">{data.notifStats.pending}</div>
                  </div>
                  <div className="p-3 bg-foreground/[0.03] border border-foreground/5">
                    <span className="text-[10px] font-mono text-foreground/30">Retrying</span>
                    <div className="text-lg font-black text-blue-400">{data.notifStats.retrying}</div>
                  </div>
                  <div className="p-3 bg-foreground/[0.03] border border-foreground/5">
                    <span className="text-[10px] font-mono text-foreground/30">Exhausted</span>
                    <div className="text-lg font-black text-red-400">{data.notifStats.exhausted}</div>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-foreground/20 mt-3">Cron retries pending/failed_retrying notifications with exponential backoff</p>
              </div>
            </div>

            {/* Architecture */}
            <div className="p-4 md:p-6 bg-card border border-foreground/10">
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Architecture Overview</span>
              <pre className="font-mono text-[11px] text-foreground/40 leading-loose text-center overflow-x-auto">
{`         ┌─────────────┐
         │   LivePay    │
         └──────┬──────┘
                │ webhook
                ▼
   ┌────────────────────────┐
   │   Payment Service      │
   │   payment_intents      │
   │   payment_transactions │  ← append-only audit log (auto-trigger)
   │   webhook_logs         │  ← every webhook, valid or not
   │   internal_notifications│ ← retry-safe delivery to apps
   └────────┬───────────────┘
        ┌───┴───┐
        ▼       ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │ SACCO  │ │ Church │ │ School │
   │  App   │ │  App   │ │  App   │
   └───┬────┘ └───┬────┘ └───┬────┘
       ▼          ▼          ▼
    Update DB  Update DB  Update DB
   
   Routing: application_id + tenant_id (NOT string-parsing references)
   Idempotency: idempotency_key on payment_intents`}
              </pre>
            </div>

            {/* Recent transactions */}
            <div className="p-4 md:p-6 bg-card border border-foreground/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Recent Payment Intents</span>
                <Link href="/transactions" className="text-[10px] font-mono tracking-[0.15em] text-accent/70 hover:text-accent transition-colors uppercase">View All →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      {['Reference', 'App', 'Tenant', 'Type', 'Amount', 'Provider', 'Date', 'Status'].map(h => (
                        <th key={h} className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentIntents.slice(0, 10).map(p => (
                      <tr key={p.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                        <td className="text-xs font-mono text-foreground/60 py-2 pr-4">{p.reference}</td>
                        <td className="text-xs font-mono py-2 pr-4" style={{ color: appColors[p.applicationCode] || '#fff' }}>{p.applicationCode}</td>
                        <td className="text-xs font-mono text-foreground/40 py-2 pr-4">{p.tenantName || '—'}</td>
                        <td className="text-xs font-mono text-foreground/50 py-2 pr-4">{(p.paymentType || '').replace(/_/g, ' ')}</td>
                        <td className="text-xs font-mono py-2 pr-4">{fmt(p.amount)}</td>
                        <td className="text-xs font-mono text-foreground/50 py-2 pr-4">{p.providerCode}</td>
                        <td className="text-xs font-mono text-foreground/40 py-2 pr-4">{fmtDate(p.createdAt)}</td>
                        <td className="py-2"><span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm ${statusColors[p.status] || ''}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="px-6 md:px-16 lg:px-24 py-6 border-t border-foreground/5 mt-8">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-foreground/20">NKOLA Pay — Payment Service v2.0</span>
          <span className="text-[10px] font-mono text-foreground/20">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  )
}

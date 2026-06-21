'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Navigation } from '@/components/portfolio/navigation'
import Link from 'next/link'

interface DashboardData {
  totalRevenue: number
  appRevenue: { name: string; displayName: string; revenue: number; count: number }[]
  statusCounts: { success: number; pending: number; failed: number }
  successRate: string
  providerRevenue: { provider: string; revenue: number; count: number }[]
  dailyRevenue: { date: string; revenue: number; count: number }[]
  recentPayments: {
    id: string
    reference: string
    application: string
    applicationName: string
    paymentType: string
    amount: number
    currency: string
    status: string
    provider: string
    tenantId: string | null
    customerId: string | null
    createdAt: string
    completedAt: string | null
  }[]
  totalPayments: number
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="p-4 md:p-6 bg-card border border-foreground/10">
      <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">{label}</span>
      <div className="text-2xl md:text-3xl font-black tracking-tight mt-1" style={accent ? { color: accent } : {}}>{value}</div>
      {sub && <span className="text-xs font-mono text-foreground/30 mt-1 block">{sub}</span>}
    </div>
  )
}

function MiniBarChart({ data, maxValue, color }: { data: number[]; maxValue: number; color: string }) {
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((value, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(2, (value / maxValue) * 100)}%` }}
          transition={{ delay: i * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 rounded-t-sm min-w-[3px]"
          style={{ backgroundColor: value > 0 ? color : 'oklch(0.22 0 0)' }}
        />
      ))}
    </div>
  )
}

function ArchitectureDiagram() {
  return (
    <div className="p-4 md:p-6 bg-card border border-foreground/10">
      <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Architecture Overview</span>
      <pre className="font-mono text-[11px] text-foreground/50 leading-loose text-center overflow-x-auto">
{`         ┌─────────────┐
         │   LivePay    │
         └──────┬──────┘
                │
                ▼
   ┌────────────────────────┐
   │   Payment Service      │
   │   (This Dashboard)     │
   └────────┬───────────────┘
         ┌───┴───┐
         │       │
    ┌────┘       └────┐
    ▼                ▼
┌────────┐    ┌────────┐    ┌────────┐
│ SACCO  │    │ Church │    │ School │
│  App   │    │  App   │    │  App   │
└───┬────┘    └───┬────┘    └───┬────┘
    ▼             ▼             ▼
 Update DB     Update DB     Update DB`}
      </pre>
      <div className="mt-4 text-[10px] font-mono text-foreground/20 text-center">
        Payment Service owns payment records. Each app owns its business rules and database updates.
      </div>
    </div>
  )
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `UGX ${(amount / 1000).toFixed(0)}K`
  return `UGX ${amount.toLocaleString()}`
}

const formatDate = (d: string | Date) => {
  const date = new Date(d)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const maxDaily = data ? Math.max(...data.dailyRevenue.map(d => d.revenue), 1) : 1
  const appColors: Record<string, string> = { sacco: '#52B788', church: '#F59E0B', school: '#EA580C' }
  const provColors: Record<string, string> = { LIVEPAY: '#52B788', MTN: '#F59E0B', AIRTEL: '#EF4444', PESAPAL: '#3B82F6' }

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-14">
        {/* Header */}
        <div className="px-6 md:px-16 lg:px-24 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Finance HQ</h1>
              <p className="text-sm text-foreground/40 mt-1">Centralized payment service — SACCO, Church, School</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-mono text-foreground/30">All systems operational</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 md:px-16 lg:px-24 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 bg-card border border-foreground/10 animate-pulse">
                  <div className="h-3 bg-foreground/10 w-20 mb-2" />
                  <div className="h-8 bg-foreground/10 w-32" />
                </div>
              ))}
            </div>
          </div>
        ) : data && (
          <div className="px-6 md:px-16 lg:px-24 py-4 space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} sub={`${data.totalPayments} total payments`} accent="oklch(0.97 0.15 70)" />
              <StatCard label="Success Rate" value={`${data.successRate}%`} sub={`${data.statusCounts.success} successful`} accent="#52B788" />
              <StatCard label="Pending" value={String(data.statusCounts.pending)} sub="Awaiting confirmation" />
              <StatCard label="Failed" value={String(data.statusCounts.failed)} sub="Needs attention" accent="#EF4444" />
            </div>

            {/* Revenue by app */}
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Revenue by Application</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {data.appRevenue.map((app) => {
                  const pct = data.totalRevenue > 0 ? (app.revenue / data.totalRevenue) * 100 : 0
                  return (
                    <div key={app.name} className="p-4 md:p-6 bg-card border border-foreground/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-foreground/60">{app.displayName}</h4>
                          <span className="text-2xl font-black" style={{ color: appColors[app.name] || '#fff' }}>{formatCurrency(app.revenue)}</span>
                        </div>
                        <span className="text-[10px] font-mono text-foreground/30">{app.count} txns</span>
                      </div>
                      <div className="mt-3 h-2 bg-foreground/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full" style={{ backgroundColor: appColors[app.name] }} />
                      </div>
                      <span className="text-[10px] font-mono text-foreground/30 mt-1 block">{pct.toFixed(1)}% of total</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Daily revenue + Provider */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 md:p-6 bg-card border border-foreground/10">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Daily Revenue — Last 14 Days</span>
                <MiniBarChart data={data.dailyRevenue.map(d => d.revenue)} maxValue={maxDaily} color="oklch(0.97 0.15 70 / 0.6)" />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-mono text-foreground/20">14 days ago</span>
                  <span className="text-[10px] font-mono text-foreground/20">Today</span>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-card border border-foreground/10">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">Revenue by Provider</span>
                <div className="space-y-3">
                  {data.providerRevenue.map((prov) => {
                    const maxProv = Math.max(...data.providerRevenue.map(p => p.revenue), 1)
                    return (
                      <div key={prov.provider}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-mono">{prov.provider}</span>
                          <span className="text-sm font-mono text-foreground/50">{formatCurrency(prov.revenue)}</span>
                        </div>
                        <div className="h-1.5 bg-foreground/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(prov.revenue / maxProv) * 100}%` }} transition={{ duration: 0.8 }} className="h-full" style={{ backgroundColor: provColors[prov.provider] || '#fff' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="p-4 md:p-6 bg-card border border-foreground/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Recent Transactions</span>
                <Link href="/transactions" className="text-[10px] font-mono tracking-[0.15em] text-accent/70 hover:text-accent transition-colors uppercase">View All →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Reference</th>
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">App</th>
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Type</th>
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Amount</th>
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Provider</th>
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Date</th>
                      <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentPayments.slice(0, 10).map((p) => (
                      <tr key={p.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors">
                        <td className="text-xs font-mono text-foreground/60 py-2.5 pr-4">{p.reference}</td>
                        <td className="text-xs font-mono py-2.5 pr-4">{p.application}</td>
                        <td className="text-xs font-mono text-foreground/50 py-2.5 pr-4">{p.paymentType.replace(/_/g, ' ')}</td>
                        <td className="text-xs font-mono py-2.5 pr-4">{formatCurrency(p.amount)}</td>
                        <td className="text-xs font-mono text-foreground/50 py-2.5 pr-4">{p.provider}</td>
                        <td className="text-xs font-mono text-foreground/40 py-2.5 pr-4">{formatDate(p.createdAt)}</td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm ${
                            p.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : p.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                          }`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Architecture */}
            <ArchitectureDiagram />
          </div>
        )}
      </div>

      <footer className="px-6 md:px-16 lg:px-24 py-6 border-t border-foreground/5 mt-8">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-foreground/20">NKOLA Pay — Payment Service v1.0</span>
          <span className="text-[10px] font-mono text-foreground/20">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  )
}

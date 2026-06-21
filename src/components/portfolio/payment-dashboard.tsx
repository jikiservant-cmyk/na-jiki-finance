'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

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
    paymentType: string
    amount: number
    currency: string
    status: string
    provider: string
    createdAt: string
  }[]
  totalPayments: number
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="p-4 md:p-6 bg-card border border-foreground/10">
      <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">{label}</span>
      <div className="text-2xl md:text-3xl font-black tracking-tight mt-1" style={accent ? { color: accent } : {}}>
        {value}
      </div>
      {sub && <span className="text-xs font-mono text-foreground/30 mt-1 block">{sub}</span>}
    </div>
  )
}

function MiniBarChart({ data, maxValue, color }: { data: number[]; maxValue: number; color: string }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((value, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(2, (value / maxValue) * 100)}%` }}
          transition={{ delay: i * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 rounded-t-sm"
          style={{ backgroundColor: color, minWidth: 2 }}
        />
      ))}
    </div>
  )
}

function FilmStripScrubber() {
  const colors = [
    '#1B4332', '#52B788', '#D8F3DC',
    '#4A1D96', '#F59E0B', '#FDF6E3',
    '#0F172A', '#F97316', '#F1F5F9',
    '#1C1917', '#EA580C', '#FFF7ED',
    '#18181B', '#A1A1AA', '#FAFAFA',
    '#365314', '#CA8A04', '#FEF9C3',
  ]

  const ref = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="mt-8">
      <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-2">
        Project Palettes — Scrub to Explore
      </span>
      <div
        ref={ref}
        className="film-strip py-2"
        onScroll={() => {
          if (ref.current) {
            const scrollLeft = ref.current.scrollLeft
            const itemWidth = 52
            setActiveIndex(Math.floor(scrollLeft / itemWidth))
          }
        }}
      >
        {colors.map((color, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-12 h-12 border border-foreground/10 cursor-pointer hover:scale-110 transition-transform scroll-snap-align-start"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-foreground/20">
          {colors[Math.min(activeIndex, colors.length - 1)]}
        </span>
        <span className="text-[10px] font-mono text-foreground/20">
          {activeIndex + 1} / {colors.length}
        </span>
      </div>
    </div>
  )
}

function ArchitectureDiagram() {
  return (
    <div className="p-4 md:p-6 bg-card border border-foreground/10 mt-6">
      <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">
        Payment Service Architecture
      </span>
      <div className="font-mono text-xs text-foreground/50 leading-loose">
        <div className="text-center text-foreground/70">
          ┌─────────────┐
        </div>
        <div className="text-center text-foreground/70">
          │   LivePay    │
        </div>
        <div className="text-center text-foreground/70">
          └──────┬──────┘
        </div>
        <div className="text-center text-accent/50">│</div>
        <div className="text-center text-accent/50">▼</div>
        <div className="text-center text-accent">
          ┌─────────────────────┐
        </div>
        <div className="text-center text-accent">
          │  Payment Service     │
        </div>
        <div className="text-center text-accent">
          │  (This Dashboard)    │
        </div>
        <div className="text-center text-accent">
          └──────┬──────────────┘
        </div>
        <div className="text-center text-foreground/50">
          ┌──────┴──────┐
        </div>
        <div className="text-center text-foreground/50">
          │             │
        </div>
        <div className="text-center text-foreground/50">▼</div>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-foreground/70">┌─────────┐</div>
            <div className="text-foreground/70">│  SACCO  │</div>
            <div className="text-foreground/70">│   App   │</div>
            <div className="text-foreground/70">└────┬────┘</div>
            <div className="text-foreground/30">│</div>
            <div className="text-foreground/30">▼</div>
            <div className="text-foreground/40 text-center">Update DB</div>
          </div>
          <div className="text-center">
            <div className="text-foreground/70">┌─────────┐</div>
            <div className="text-foreground/70">│ Church  │</div>
            <div className="text-foreground/70">│   App   │</div>
            <div className="text-foreground/70">└────┬────┘</div>
            <div className="text-foreground/30">│</div>
            <div className="text-foreground/30">▼</div>
            <div className="text-foreground/40 text-center">Update DB</div>
          </div>
          <div className="text-center">
            <div className="text-foreground/70">┌─────────┐</div>
            <div className="text-foreground/70">│ School  │</div>
            <div className="text-foreground/70">│   App   │</div>
            <div className="text-foreground/70">└────┬────┘</div>
            <div className="text-foreground/30">│</div>
            <div className="text-foreground/30">▼</div>
            <div className="text-foreground/40 text-center">Update DB</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PaymentDashboard() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `UGX ${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `UGX ${(amount / 1000).toFixed(0)}K`
    return `UGX ${amount}`
  }

  const maxDaily = data ? Math.max(...data.dailyRevenue.map(d => d.revenue), 1) : 1

  return (
    <section id="dashboard" className="px-6 md:px-16 lg:px-24 py-24">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Payment Infrastructure</span>
        <h2 className="text-5xl md:text-7xl font-black tracking-[-0.03em] mt-4">
          Finance<br />HQ
        </h2>
        <p className="text-lg text-foreground/50 mt-4 max-w-xl">
          Centralized payment service dashboard. Every transaction across SACCO, Church, and School platforms flows through this single integration point with LivePay.
        </p>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-card border border-foreground/10 animate-pulse">
              <div className="h-3 bg-foreground/10 w-20 mb-2" />
              <div className="h-8 bg-foreground/10 w-32" />
            </div>
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              sub={`${data.totalPayments} total payments`}
              accent="oklch(0.97 0.15 70)"
            />
            <StatCard
              label="Success Rate"
              value={`${data.successRate}%`}
              sub={`${data.statusCounts.success} successful`}
              accent="#52B788"
            />
            <StatCard
              label="Pending"
              value={String(data.statusCounts.pending)}
              sub="Awaiting confirmation"
            />
            <StatCard
              label="Failed"
              value={String(data.statusCounts.failed)}
              sub="Needs attention"
              accent="#EF4444"
            />
          </div>

          {/* Revenue by app */}
          <div className="mt-8">
            <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">
              Revenue by Application
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {data.appRevenue.map((app) => {
                const percentage = data.totalRevenue > 0 ? (app.revenue / data.totalRevenue) * 100 : 0
                const appColors: Record<string, string> = {
                  sacco: '#52B788',
                  church: '#F59E0B',
                  school: '#EA580C',
                }
                return (
                  <div key={app.name} className="p-4 md:p-6 bg-card border border-foreground/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold">{app.displayName}</h4>
                        <span className="text-2xl font-black" style={{ color: appColors[app.name] || '#fff' }}>
                          {formatCurrency(app.revenue)}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-foreground/30">{app.count} txns</span>
                    </div>
                    <div className="mt-3 h-2 bg-foreground/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full"
                        style={{ backgroundColor: appColors[app.name] || '#fff' }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground/30 mt-1 block">
                      {percentage.toFixed(1)}% of total
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily revenue chart + Provider breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            {/* Daily revenue */}
            <div className="p-4 md:p-6 bg-card border border-foreground/10">
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">
                Daily Revenue — Last 14 Days
              </span>
              <MiniBarChart
                data={data.dailyRevenue.map(d => d.revenue)}
                maxValue={maxDaily}
                color="oklch(0.97 0.15 70 / 0.6)"
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-mono text-foreground/20">14 days ago</span>
                <span className="text-[10px] font-mono text-foreground/20">Today</span>
              </div>
            </div>

            {/* Provider breakdown */}
            <div className="p-4 md:p-6 bg-card border border-foreground/10">
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">
                Revenue by Provider
              </span>
              <div className="space-y-3">
                {data.providerRevenue.map((prov) => {
                  const provColors: Record<string, string> = {
                    LIVEPAY: '#52B788',
                    MTN: '#F59E0B',
                    AIRTEL: '#EF4444',
                    PESAPAL: '#3B82F6',
                  }
                  const maxProv = Math.max(...data.providerRevenue.map(p => p.revenue), 1)
                  const pct = (prov.revenue / maxProv) * 100
                  return (
                    <div key={prov.provider}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-mono">{prov.provider}</span>
                        <span className="text-sm font-mono text-foreground/50">{formatCurrency(prov.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-foreground/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full"
                          style={{ backgroundColor: provColors[prov.provider] || '#fff' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent transactions table */}
          <div className="mt-8 p-4 md:p-6 bg-card border border-foreground/10">
            <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-4">
              Recent Transactions
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Reference</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">App</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Type</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Amount</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2 pr-4">Provider</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b border-foreground/5">
                      <td className="text-xs font-mono text-foreground/60 py-2 pr-4">{payment.reference}</td>
                      <td className="text-xs font-mono py-2 pr-4">{payment.application}</td>
                      <td className="text-xs font-mono text-foreground/50 py-2 pr-4">{payment.paymentType}</td>
                      <td className="text-xs font-mono py-2 pr-4">{formatCurrency(payment.amount)}</td>
                      <td className="text-xs font-mono text-foreground/50 py-2 pr-4">{payment.provider}</td>
                      <td className="py-2">
                        <span
                          className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm ${
                            payment.status === 'SUCCESS'
                              ? 'bg-green-500/10 text-green-400'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Architecture diagram */}
          <ArchitectureDiagram />

          {/* Film strip color scrubber */}
          <FilmStripScrubber />
        </>
      )}
    </section>
  )
}

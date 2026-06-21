'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/portfolio/navigation'

interface Payment {
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

const appColors: Record<string, string> = { sacco: '#52B788', church: '#F59E0B', school: '#EA580C' }

export default function TransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterApp, setFilterApp] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => { setPayments(d.recentPayments || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = payments.filter(p => {
    if (filterApp !== 'ALL' && p.applicationName !== filterApp) return false
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
    if (filterType !== 'ALL' && p.paymentType !== filterType) return false
    return true
  })

  const paymentTypes = [...new Set(payments.map(p => p.paymentType))]
  const totalFiltered = filtered.reduce((sum, p) => sum + p.amount, 0)
  const successFiltered = filtered.filter(p => p.status === 'SUCCESS').length

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-14">
        <div className="px-6 md:px-16 lg:px-24 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Transactions</h1>
              <p className="text-sm text-foreground/40 mt-1">All payment transactions across applications</p>
            </div>
            <div className="flex gap-4 text-sm font-mono">
              <span className="text-foreground/40">{filtered.length} results</span>
              <span className="text-foreground/20">|</span>
              <span className="text-accent/70">{formatCurrency(totalFiltered)}</span>
              <span className="text-foreground/20">|</span>
              <span className="text-green-400/70">{successFiltered} successful</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 md:px-16 lg:px-24 py-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterApp}
              onChange={e => setFilterApp(e.target.value)}
              className="bg-card border border-foreground/10 px-3 py-2 text-xs font-mono text-foreground/60 focus:border-accent focus:outline-none"
            >
              <option value="ALL">All Apps</option>
              <option value="sacco">SACCO</option>
              <option value="church">Church</option>
              <option value="school">School</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-card border border-foreground/10 px-3 py-2 text-xs font-mono text-foreground/60 focus:border-accent focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-card border border-foreground/10 px-3 py-2 text-xs font-mono text-foreground/60 focus:border-accent focus:outline-none"
            >
              <option value="ALL">All Types</option>
              {paymentTypes.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 md:px-16 lg:px-24 pb-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-card border border-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-foreground/10 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Reference</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">App</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Type</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Amount</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Provider</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Tenant</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Customer</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3 pr-4">Date</th>
                    <th className="text-[10px] font-mono tracking-[0.15em] text-foreground/30 uppercase p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="text-xs font-mono text-foreground/70 p-3 pr-4">{p.reference}</td>
                      <td className="text-xs font-mono p-3 pr-4">
                        <span style={{ color: appColors[p.applicationName] || '#fff' }}>{p.application}</span>
                      </td>
                      <td className="text-xs font-mono text-foreground/50 p-3 pr-4">{p.paymentType.replace(/_/g, ' ')}</td>
                      <td className="text-xs font-mono p-3 pr-4">{formatCurrency(p.amount)}</td>
                      <td className="text-xs font-mono text-foreground/50 p-3 pr-4">{p.provider}</td>
                      <td className="text-xs font-mono text-foreground/40 p-3 pr-4">{p.tenantId || '—'}</td>
                      <td className="text-xs font-mono text-foreground/40 p-3 pr-4">{p.customerId || '—'}</td>
                      <td className="text-xs font-mono text-foreground/40 p-3 pr-4">{formatDate(p.createdAt)}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-sm ${
                          p.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : p.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>{p.status}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-foreground/30 font-mono">No transactions match your filters</div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="px-6 md:px-16 lg:px-24 py-6 border-t border-foreground/5 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-foreground/20">NKOLA Pay — Payment Service v1.0</span>
          <span className="text-[10px] font-mono text-foreground/20">{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  )
}

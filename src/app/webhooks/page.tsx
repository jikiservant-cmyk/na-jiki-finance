'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/portfolio/navigation'

interface WebhookLog {
  id: string
  paymentId: string | null
  provider: string
  eventType: string
  payload: string
  signature: string | null
  verified: boolean
  processed: boolean
  error: string | null
  createdAt: string
  payment?: { reference: string; amount: number; status: string } | null
}

const formatDate = (d: string | Date) => {
  const date = new Date(d)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const provColors: Record<string, string> = { LIVEPAY: '#52B788', MTN: '#F59E0B', AIRTEL: '#EF4444', PESAPAL: '#3B82F6' }

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/webhooks')
      .then(res => res.json())
      .then(d => { setLogs(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const verifiedCount = logs.filter(l => l.verified).length
  const processedCount = logs.filter(l => l.processed).length
  const errorCount = logs.filter(l => l.error).length

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-14">
        <div className="px-6 md:px-16 lg:px-24 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Webhook Logs</h1>
              <p className="text-sm text-foreground/40 mt-1">Incoming webhook events from payment providers</p>
            </div>
            <div className="flex gap-4 text-sm font-mono">
              <span className="text-foreground/40">{logs.length} total</span>
              <span className="text-foreground/20">|</span>
              <span className="text-green-400/70">{verifiedCount} verified</span>
              <span className="text-foreground/20">|</span>
              <span className="text-blue-400/70">{processedCount} processed</span>
              {errorCount > 0 && (
                <>
                  <span className="text-foreground/20">|</span>
                  <span className="text-red-400/70">{errorCount} errors</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 md:px-16 lg:px-24 py-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-foreground/10">
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Verified</span>
              <div className="text-xl font-black text-green-400 mt-1">{verifiedCount} / {logs.length}</div>
            </div>
            <div className="p-4 bg-card border border-foreground/10">
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Processed</span>
              <div className="text-xl font-black text-blue-400 mt-1">{processedCount} / {logs.length}</div>
            </div>
            <div className="p-4 bg-card border border-foreground/10">
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase">Errors</span>
              <div className="text-xl font-black text-red-400 mt-1">{errorCount}</div>
            </div>
          </div>
        </div>

        {/* Log list */}
        <div className="px-6 md:px-16 lg:px-24 py-4 pb-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-card border border-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-card border border-foreground/10"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-foreground/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.verified ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`w-2 h-2 rounded-full ${log.processed ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: provColors[log.provider] || '#fff' }}>{log.provider}</span>
                      <span className="text-xs font-mono text-foreground/60">{log.eventType}</span>
                      {log.payment && (
                        <span className="text-xs font-mono text-foreground/40">{log.payment.reference}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {log.error && <span className="text-[10px] font-mono text-red-400">ERROR</span>}
                      <span className="text-[10px] font-mono text-foreground/30">{formatDate(log.createdAt)}</span>
                      <span className="text-foreground/20 text-xs">{expandedId === log.id ? '▼' : '▶'}</span>
                    </div>
                  </button>

                  {expandedId === log.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-foreground/5 p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Event</span>
                          <span className="text-sm font-mono">{log.eventType}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Provider</span>
                          <span className="text-sm font-mono" style={{ color: provColors[log.provider] || '#fff' }}>{log.provider}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Verified</span>
                          <span className={`text-sm font-mono ${log.verified ? 'text-green-400' : 'text-red-400'}`}>{log.verified ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Processed</span>
                          <span className={`text-sm font-mono ${log.processed ? 'text-blue-400' : 'text-yellow-400'}`}>{log.processed ? 'Yes' : 'No'}</span>
                        </div>
                        {log.signature && (
                          <div className="md:col-span-2">
                            <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Signature</span>
                            <span className="text-[10px] font-mono text-foreground/40 break-all">{log.signature}</span>
                          </div>
                        )}
                        {log.error && (
                          <div className="md:col-span-2">
                            <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Error</span>
                            <span className="text-sm font-mono text-red-400">{log.error}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-1">Payload</span>
                        <pre className="text-[10px] font-mono text-foreground/40 bg-foreground/[0.03] p-3 rounded overflow-x-auto max-h-40">
                          {(() => {
                            try { return JSON.stringify(JSON.parse(log.payload), null, 2) }
                            catch { return log.payload }
                          })()}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {logs.length === 0 && (
                <div className="p-8 text-center text-sm text-foreground/30 font-mono">No webhook logs found</div>
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

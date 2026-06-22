import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type RealtimeEvent = {
  type: 'payment' | 'webhook' | 'notification'
  payload: Record<string, unknown>
  timestamp: Date
}

export function useRealtimeDashboard(onRefresh: () => void) {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [connected, setConnected] = useState(false)

  const pushEvent = useCallback((event: RealtimeEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50))
    onRefresh()
  }, [onRefresh])

  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('admin-dashboard')

      // Payment status changes
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'PaymentIntent',
      }, payload => {
        pushEvent({
          type: 'payment',
          payload: payload.new as Record<string, unknown>,
          timestamp: new Date(),
        })
      })

      // Webhook events
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'WebhookLog',
      }, payload => {
        pushEvent({
          type: 'webhook',
          payload: payload.new as Record<string, unknown>,
          timestamp: new Date(),
        })
      })

      // Internal notifications
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'InternalNotification',
      }, payload => {
        pushEvent({
          type: 'notification',
          payload: payload.new as Record<string, unknown>,
          timestamp: new Date(),
        })
      })

      .subscribe(status => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [pushEvent])

  return { events, connected }
}

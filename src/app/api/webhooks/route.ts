import { NextResponse } from 'next/server'
import { getWebhookLogs } from '@/lib/data'

export async function GET() {
  try {
    const logs = await getWebhookLogs(50)
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Webhooks API error:', error)
    return NextResponse.json({ error: 'Failed to fetch webhook logs' }, { status: 500 })
  }
}

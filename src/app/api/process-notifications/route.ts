import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const pendingNotifications = await db.internal_notifications.findMany({
      where: { status: { in: ['pending', 'failed_retrying'] } },
      include: { payment_intents: { include: { applications: true } }, applications: true },
      orderBy: { created_at: 'asc' },
    })
    const results: Array<{
      id: string
      status: 'delivered' | 'failed_retrying' | 'failed_exhausted'
      statusCode?: number
      error?: string
    }> = []

    for (const notification of pendingNotifications) {
      try {
        console.log(`Processing notification ${notification.id} to ${notification.url}`)

        // Send the notification
        const response = await fetch(notification.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Najiki-Notification': 'true',
          },
          body: JSON.stringify(notification.payload),
        })

        if (response.ok) {
          // Success!
          await db.internal_notifications.update({
            where: { id: notification.id },
            data: {
              status: 'delivered',
              attempt_count: notification.attempt_count + 1,
              last_attempt_at: new Date(),
              last_response_status: response.status,
              next_retry_at: null,
            },
          })
          results.push({ id: notification.id, status: 'delivered', statusCode: response.status })
        } else {
          // Failed but we might retry
          const newAttemptCount = notification.attempt_count + 1
          const shouldRetry = newAttemptCount < (notification.max_attempts || 5)
          const newStatus = shouldRetry ? 'failed_retrying' : 'failed_exhausted'
          const nextRetryAt = shouldRetry 
            ? new Date(Date.now() + Math.pow(2, newAttemptCount) * 60000) // Exponential backoff
            : null

          await db.internal_notifications.update({
            where: { id: notification.id },
            data: {
              status: newStatus,
              attempt_count: newAttemptCount,
              last_attempt_at: new Date(),
              last_response_status: response.status,
              next_retry_at: nextRetryAt,
            },
          })
          results.push({ id: notification.id, status: newStatus, statusCode: response.status })
        }
      } catch (error) {
        // Network error or other failure
        const newAttemptCount = notification.attempt_count + 1
        const shouldRetry = newAttemptCount < (notification.max_attempts || 5)
        const newStatus = shouldRetry ? 'failed_retrying' : 'failed_exhausted'
        const nextRetryAt = shouldRetry 
          ? new Date(Date.now() + Math.pow(2, newAttemptCount) * 60000)
          : null

        await db.internal_notifications.update({
          where: { id: notification.id },
          data: {
            status: newStatus,
            attempt_count: newAttemptCount,
            last_attempt_at: new Date(),
            last_response_status: null,
            last_response_body: error instanceof Error ? error.message : 'Unknown error',
            next_retry_at: nextRetryAt,
          },
        })
        results.push({ id: notification.id, status: newStatus, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingNotifications.length,
      results,
    })
  } catch (error) {
    console.error('Error processing notifications:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
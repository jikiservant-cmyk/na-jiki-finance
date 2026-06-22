import {
  PaymentProvider,
  InitiatePaymentParams,
  InitiatePaymentResponse,
  PaymentStatusResponse,
  ParsedWebhook,
} from './types'
import crypto from 'crypto'

export class LivePayProvider implements PaymentProvider {
  code = 'livepay'
  name = 'LivePay'

  private apiKey: string
  private apiSecret: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.LIVEPAY_API_KEY || ''
    this.apiSecret = process.env.LIVEPAY_API_SECRET || ''
    this.baseUrl = process.env.LIVEPAY_BASE_URL || 'https://api.livepay.africa'
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResponse> {
    try {
      // Example LivePay API request (adjust according to actual LivePay docs)
      const payload = {
        amount: params.amount,
        currency: params.currency,
        phone_number: params.phoneNumber,
        merchant_reference: params.reference,
        description: params.description || 'Payment',
        metadata: params.metadata,
      }

      const response = await fetch(`${this.baseUrl}/v1/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Secret': this.apiSecret,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        return {
          success: true,
          providerPaymentId: data.transaction_id,
          status: 'processing',
          metadata: data,
        }
      }

      return {
        success: false,
        status: 'failed',
        failureReason: data.message || 'Failed to initiate payment',
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async checkPaymentStatus(providerPaymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${providerPaymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Secret': this.apiSecret,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Map LivePay status to our standard status
        const statusMap: Record<string, any> = {
          'pending': 'pending',
          'processing': 'processing',
          'completed': 'success',
          'failed': 'failed',
          'expired': 'expired',
          'cancelled': 'cancelled',
        }

        return {
          success: true,
          status: statusMap[data.status] || 'pending',
          amount: data.amount,
          currency: data.currency,
          providerPaymentId: data.transaction_id,
        }
      }

      return {
        success: false,
        status: 'failed',
        failureReason: data.message || 'Failed to check status',
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async validateWebhookSignature(payload: string, signature: string, headers?: Record<string, string>): Promise<boolean> {
    try {
      // Example signature validation (adjust according to LivePay docs)
      // LivePay might use HMAC-SHA256 with API secret
      const hmac = crypto.createHmac('sha256', this.apiSecret)
      const computedSignature = hmac.update(payload).digest('hex')
      return computedSignature === signature
    } catch {
      return false
    }
  }

  async parseWebhookPayload(payload: any): Promise<ParsedWebhook> {
    // Map LivePay webhook to our standard format
    const statusMap: Record<string, any> = {
      'payment_pending': 'pending',
      'payment_processing': 'processing',
      'payment_completed': 'success',
      'payment_failed': 'failed',
      'payment_expired': 'expired',
      'payment_cancelled': 'cancelled',
    }

    return {
      reference: payload.merchant_reference,
      providerPaymentId: payload.transaction_id,
      status: statusMap[payload.event_type] || 'pending',
      amount: payload.amount,
      currency: payload.currency,
      metadata: payload,
      failureReason: payload.failure_reason,
    }
  }
}

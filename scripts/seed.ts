import { db } from '../src/lib/db'

async function seed() {
  const sacco = await db.application.create({
    data: {
      name: 'sacco',
      displayName: 'SACCO System',
      webhookUrl: 'https://sacco.example.com/api/internal/payment-completed',
      apiKey: 'sacco-secret-key-001',
      active: true,
    },
  })

  const church = await db.application.create({
    data: {
      name: 'church',
      displayName: 'Church App',
      webhookUrl: 'https://church.example.com/api/internal/payment-completed',
      apiKey: 'church-secret-key-002',
      active: true,
    },
  })

  const school = await db.application.create({
    data: {
      name: 'school',
      displayName: 'School Platform',
      webhookUrl: 'https://school.example.com/api/internal/payment-completed',
      apiKey: 'school-secret-key-003',
      active: true,
    },
  })

  const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'PENDING', 'FAILED']
  const providers = ['LIVEPAY', 'MTN', 'AIRTEL', 'PESAPAL']
  const apps = [sacco, church, school]
  const appPaymentTypes: Record<string, string[]> = {
    sacco: ['DEPOSIT', 'LOAN_REPAYMENT'],
    church: ['TITHE', 'OFFERING'],
    school: ['TUITION', 'SUBSCRIPTION'],
  }

  for (let day = 14; day >= 0; day--) {
    const date = new Date()
    date.setDate(date.getDate() - day)
    
    for (const app of apps) {
      const types = appPaymentTypes[app.name]
      const numPayments = Math.floor(Math.random() * 4) + 1
      
      for (let i = 0; i < numPayments; i++) {
        const type = types[Math.floor(Math.random() * types.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const provider = providers[Math.floor(Math.random() * providers.length)]
        const amount = Math.floor(Math.random() * 500000) + 10000
        const createdAt = new Date(date)
        createdAt.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60))

        const payment = await db.payment.create({
          data: {
            reference: `${app.name.toUpperCase()}-${type}-${String(day * 10 + i).padStart(5, '0')}`,
            applicationId: app.id,
            tenantId: `tenant-${Math.floor(Math.random() * 5) + 1}`,
            customerId: `cust-${Math.floor(Math.random() * 50) + 1}`,
            paymentType: type,
            amount,
            currency: 'UGX',
            status,
            provider,
            providerReference: `prov-${Math.random().toString(36).substring(2, 10)}`,
            completedAt: status === 'SUCCESS' ? new Date(createdAt.getTime() + 30000) : null,
            createdAt,
          },
        })

        await db.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'PAYMENT',
            status,
            amount,
            metadata: JSON.stringify({ provider, method: 'MOBILE_MONEY' }),
            createdAt,
          },
        })
      }
    }
  }

  // Create some webhook logs
  const recentPayments = await db.payment.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
  for (const p of recentPayments) {
    await db.webhookLog.create({
      data: {
        paymentId: p.id,
        provider: p.provider || 'LIVEPAY',
        eventType: 'PAYMENT_COMPLETED',
        payload: JSON.stringify({ reference: p.reference, amount: p.amount, status: p.status }),
        verified: true,
        processed: true,
      },
    })
  }

  console.log('Seed completed successfully!')
  await db.$disconnect()
}

seed().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})

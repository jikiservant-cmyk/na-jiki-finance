import { db } from '../src/lib/db'

async function seed() {
  // Create applications
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

  // Generate payments for the last 14 days (reduced for speed)
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
            status: status,
            amount: amount,
            metadata: JSON.stringify({ provider, method: 'MOBILE_MONEY' }),
            createdAt,
          },
        })
      }
    }
  }

  // Create portfolio projects
  const projects = [
    {
      title: 'SACCO Brand System',
      slug: 'sacco-brand-system',
      category: 'Logo System',
      year: '2024',
      description: 'A comprehensive brand identity for a Savings and Credit Cooperative Organization, drawing from East African textile patterns and the geometry of communal finance.',
      editorial: 'The SACCO brand system was conceived as a visual language of trust and community. The logomark interweaves the letter S with the Adinkra symbol for cooperation, creating a mark that speaks simultaneously to modern finance and ancestral wisdom. The typographic system uses a custom-weighted grotesque paired with a geometric sans, establishing hierarchy across digital and print touchpoints. From member cards to mobile interfaces, every surface tells the same story: your money is safe with us.',
      colorPrimary: '#1B4332',
      colorSecondary: '#52B788',
      colorTertiary: '#D8F3DC',
      imageUrl: '/projects/sacco-brand.jpg',
      sortOrder: 0,
    },
    {
      title: 'Church Connect Identity',
      slug: 'church-connect-identity',
      category: 'Logo System',
      year: '2024',
      description: 'A contemporary visual identity for a digital church platform, balancing reverence with accessibility.',
      editorial: 'Church Connect required an identity that could exist comfortably on a Sunday bulletin and a push notification. The solution: a logomark derived from the intersection of a cross and a speech bubble — worship meets conversation. The primary typeface carries liturgical weight, while the secondary humanist sans handles digital wayfinding. The color system moves from deep ecclesiastical violet to warm amber, mapping the arc from contemplation to community.',
      colorPrimary: '#4A1D96',
      colorSecondary: '#F59E0B',
      colorTertiary: '#FDF6E3',
      imageUrl: '/projects/church-connect.jpg',
      sortOrder: 1,
    },
    {
      title: 'PayFlow Packaging',
      slug: 'payflow-packaging',
      category: 'Packaging',
      year: '2023',
      description: 'Retail packaging design for a fintech hardware product, transforming the unboxing into a statement of financial empowerment.',
      editorial: 'PayFlow asked: what if opening a payment terminal felt like opening a passport? The packaging system treats each device as a ticket to financial independence. The exterior uses a matte black stock with a single foil-stamped logomark — understated, confident. Inside, a concertina fold reveals operating instructions as a visual journey, with each panel representing a feature.',
      colorPrimary: '#0F172A',
      colorSecondary: '#F97316',
      colorTertiary: '#F1F5F9',
      imageUrl: '/projects/payflow-packaging.jpg',
      sortOrder: 2,
    },
    {
      title: 'Kampala Type Festival',
      slug: 'kampala-type-festival',
      category: 'Posters',
      year: '2024',
      description: "A series of typographic posters for East Africa's first international type design conference.",
      editorial: 'The Kampala Type Festival posters operate on a simple premise: let the letters speak for themselves. Each poster in the series isolates a single letterform from a custom display typeface inspired by Luganda orthography and the angularity of bark cloth patterns. The color palette — bright orange against deep charcoal — references the marketplace signage of Owino and the painted matatu routes that crisscross the city.',
      colorPrimary: '#1C1917',
      colorSecondary: '#EA580C',
      colorTertiary: '#FFF7ED',
      imageUrl: '/projects/kampala-type.jpg',
      sortOrder: 3,
    },
    {
      title: 'Nkola Type Specimen',
      slug: 'nkola-type-specimen',
      category: 'Type Design',
      year: '2023',
      description: 'A custom variable typeface designed for financial interfaces, with optical sizes for display and text.',
      editorial: 'Nkola was born from a specific problem: financial dashboards in East Africa were using typefaces designed for European newspaper layouts. The Regular and Medium weights are built on a generous x-height with open counters, optimized for data tables. The Bold and Black weights push the contrast further, creating dramatic headlines that still carry the geometric DNA of the text sizes.',
      colorPrimary: '#18181B',
      colorSecondary: '#A1A1AA',
      colorTertiary: '#FAFAFA',
      imageUrl: '/projects/nkola-type.jpg',
      sortOrder: 4,
    },
    {
      title: 'Harvest Season Posters',
      slug: 'harvest-season-posters',
      category: 'Posters',
      year: '2023',
      description: 'A limited-edition poster series celebrating agricultural cooperatives in rural Uganda.',
      editorial: 'Harvest Season is a suite of six screen-printed posters, each one mapping a cooperative crop cycle through abstracted landforms and typographic season markers. Two-color risograph on recycled sugar paper produces slight mis-registration that makes every print unique. Colors derive from actual harvest tones: groundnut brown, millet gold, coffee cherry red.',
      colorPrimary: '#365314',
      colorSecondary: '#CA8A04',
      colorTertiary: '#FEF9C3',
      imageUrl: '/projects/harvest-posters.jpg',
      sortOrder: 5,
    },
  ]

  for (const project of projects) {
    await db.portfolioProject.create({ data: project })
  }

  console.log('Seed completed successfully!')
  await db.$disconnect()
}

seed().catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})

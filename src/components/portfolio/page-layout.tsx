'use client'

import { Navigation } from '@/components/portfolio/navigation'
import { RisographTrail } from '@/components/portfolio/risograph-trail'

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen">
      <RisographTrail />
      <Navigation />
      {children}
    </main>
  )
}

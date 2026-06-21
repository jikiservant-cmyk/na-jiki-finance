'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/portfolio/navigation'
import { HeroSection } from '@/components/portfolio/hero-section'
import { ProjectsSection } from '@/components/portfolio/projects-section'
import { TypeSpecimensSection } from '@/components/portfolio/type-specimens'
import { LecturesSection } from '@/components/portfolio/lectures-section'
import { PaymentDashboard } from '@/components/portfolio/payment-dashboard'
import { ContactSection } from '@/components/portfolio/contact-section'
import { RisographTrail } from '@/components/portfolio/risograph-trail'

interface Project {
  id: string
  title: string
  slug: string
  category: string
  year: string
  description: string
  editorial: string
  colorPrimary: string
  colorSecondary: string
  colorTertiary: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="relative min-h-screen">
      {/* Risograph cursor trail */}
      <RisographTrail />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Projects Section */}
      {loading ? (
        <div className="px-6 md:px-16 lg:px-24 py-24">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-foreground/10 w-32" />
            <div className="h-16 bg-foreground/10 w-3/4" />
            <div className="h-64 bg-foreground/5 w-full" />
          </div>
        </div>
      ) : (
        <ProjectsSection projects={projects} />
      )}

      {/* Type Specimens */}
      <div className="h-px bg-foreground/5" />
      <TypeSpecimensSection />

      {/* Lectures & Talks */}
      <div className="h-px bg-foreground/5" />
      <LecturesSection />

      {/* Payment Dashboard */}
      <div className="h-px bg-foreground/5" />
      <PaymentDashboard />

      {/* Contact */}
      <div className="h-px bg-foreground/5" />
      <ContactSection />

      {/* Footer */}
      <footer className="px-6 md:px-16 lg:px-24 py-8 border-t border-foreground/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black tracking-tight">NKOLA<span className="text-accent">.</span></span>
            <span className="text-[10px] font-mono text-foreground/20">Brand &amp; Design Studio / Payment Infrastructure</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono text-foreground/20">Kampala, UG</span>
            <span className="text-[10px] font-mono text-foreground/20">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

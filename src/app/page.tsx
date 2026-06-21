'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PageLayout } from '@/components/portfolio/page-layout'

const sections = [
  {
    href: '/work',
    label: 'Selected Work',
    number: '01',
    description: 'Brand systems, packaging, posters, and type design for East African fintech and culture.',
  },
  {
    href: '/type',
    label: 'Type Specimens',
    number: '02',
    description: 'Custom typefaces designed for financial interfaces. Download specimen PDFs.',
  },
  {
    href: '/talks',
    label: 'Lectures & Talks',
    number: '03',
    description: 'Speaking on design, typography, and payment infrastructure across East Africa.',
  },
  {
    href: '/payments',
    label: 'Payment Infrastructure',
    number: '04',
    description: 'Centralized payment service dashboard. SACCO, Church, and School — one integration point.',
  },
  {
    href: '/contact',
    label: 'Contact',
    number: '05',
    description: 'Let\'s talk about your next project.',
  },
]

export default function Home() {
  const firstName = 'NKOLA'
  const lastName = 'STUDIO'

  const letterVariants = {
    hidden: { y: 120, opacity: 0, rotateX: -90 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        delay: 0.3 + i * 0.05,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { delay: 1.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-foreground/20" />
        <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-foreground/20" />
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-foreground/20" />
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-foreground/20" />

        <div className="relative z-10 px-6 md:px-16 lg:px-24">
          <div className="overflow-hidden">
            <div className="flex flex-wrap">
              {firstName.split('').map((letter, i) => (
                <motion.span
                  key={`first-${i}`}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-[clamp(5rem,18vw,16rem)] leading-[0.85] font-black tracking-[-0.04em] text-foreground"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden mt-2 md:mt-4">
            <div className="flex flex-wrap">
              {lastName.split('').map((letter, i) => (
                <motion.span
                  key={`last-${i}`}
                  custom={i + firstName.length}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-[clamp(5rem,18vw,16rem)] leading-[0.85] font-black tracking-[-0.04em] text-foreground/20"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.div
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className="h-px bg-foreground/40 mt-8 md:mt-12 origin-left"
          />

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between mt-6 gap-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono tracking-[0.3em] text-foreground/50 uppercase">
                Brand &amp; Design Studio
              </span>
              <span className="text-xs font-mono text-foreground/30">—</span>
              <span className="text-xs font-mono tracking-[0.3em] text-foreground/50 uppercase">
                Payment Infrastructure
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs font-mono text-foreground/40">Kampala, UG</span>
              <span className="text-xs font-mono text-foreground/40">Est. 2023</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] text-foreground/30 uppercase">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-px h-8 bg-foreground/20"
          />
        </motion.div>
      </section>

      {/* Section Index */}
      <section className="px-6 md:px-16 lg:px-24 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Index</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.02em] mt-4">
            Navigate
          </h2>
        </motion.div>

        <div className="space-y-0">
          {sections.map((section, i) => (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={section.href}
                className="group flex items-start md:items-center justify-between py-6 border-b border-foreground/5 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start md:items-center gap-6">
                  <span className="text-xs font-mono text-foreground/20 w-8">{section.number}</span>
                  <div>
                    <h3 className="text-xl md:text-3xl font-black tracking-tight group-hover:text-accent transition-colors">
                      {section.label}
                    </h3>
                    <p className="text-sm text-foreground/40 mt-1 max-w-md">{section.description}</p>
                  </div>
                </div>
                <motion.span
                  className="text-foreground/20 group-hover:text-foreground/60 transition-colors text-2xl mt-1"
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

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
    </PageLayout>
  )
}

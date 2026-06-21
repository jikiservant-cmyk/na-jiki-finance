'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/webhooks', label: 'Webhooks' },
]

export function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 h-14">
          <Link href="/" className="text-sm font-black tracking-[-0.02em] hover:opacity-70 transition-opacity">
            NKOLA<span className="text-accent">.</span> Pay
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-mono tracking-[0.2em] uppercase transition-colors ${
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/30 hover:text-foreground/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono text-foreground/30">Live</span>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 w-6"
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="h-px bg-foreground/70 w-full origin-center" />
            <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="h-px bg-foreground/70 w-full" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="h-px bg-foreground/70 w-full origin-center" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg flex items-center justify-center md:hidden"
          >
            <div className="flex flex-col items-center gap-8">
              {navItems.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Link href={item.href} onClick={() => setMenuOpen(false)} className="text-3xl font-black tracking-tight">{item.label}</Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

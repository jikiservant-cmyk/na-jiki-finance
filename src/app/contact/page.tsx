'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { PageLayout } from '@/components/portfolio/page-layout'

export default function ContactPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [formState, setFormState] = useState({ name: '', email: '', project: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormState({ name: '', email: '', project: '', message: '' })
  }

  return (
    <PageLayout>
      <div className="pt-14">
        <div className="px-6 md:px-16 lg:px-24 pt-24 pb-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Get in Touch</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.04em] mt-4">
              Let&apos;s<br />Talk
            </h1>
          </motion.div>
        </div>

        <div className="px-6 md:px-16 lg:px-24 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-lg font-bold mb-2">Studio</h3>
                <p className="text-foreground/50 leading-relaxed">
                  Nkola Studio operates at the intersection of brand design and financial infrastructure. We build visual systems that people trust with their money, their faith, and their communities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Services</h3>
                <ul className="space-y-2 text-foreground/50">
                  {['Brand Identity Systems', 'Typeface Design', 'Packaging Design', 'Payment Infrastructure', 'Editorial Design', 'Web & App Design'].map(s => (
                    <li key={s} className="flex items-center gap-3">
                      <span className="w-1 h-1 bg-accent rounded-full" />
                      <span className="text-sm">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Reach Us</h3>
                <div className="space-y-2 text-sm font-mono text-foreground/50">
                  <p>hello@nkola.studio</p>
                  <p>+256 700 000 000</p>
                  <p>Kampala, Uganda</p>
                </div>
              </div>

              <div className="h-px bg-foreground/10" />

              <div className="flex gap-6">
                {['Twitter', 'Instagram', 'LinkedIn', 'Dribbble'].map(social => (
                  <a key={social} href="#" className="text-xs font-mono tracking-[0.15em] text-foreground/30 hover:text-foreground transition-colors editorial-link">{social}</a>
                ))}
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-2">Name</label>
                <input type="text" value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))} className="w-full bg-transparent border-b border-foreground/20 py-3 text-foreground font-mono text-sm focus:border-accent focus:outline-none transition-colors" placeholder="Your name" required />
              </div>
              <div>
                <label className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-2">Email</label>
                <input type="email" value={formState.email} onChange={e => setFormState(s => ({ ...s, email: e.target.value }))} className="w-full bg-transparent border-b border-foreground/20 py-3 text-foreground font-mono text-sm focus:border-accent focus:outline-none transition-colors" placeholder="you@company.com" required />
              </div>
              <div>
                <label className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-2">Project Type</label>
                <select value={formState.project} onChange={e => setFormState(s => ({ ...s, project: e.target.value }))} className="w-full bg-transparent border-b border-foreground/20 py-3 text-foreground font-mono text-sm focus:border-accent focus:outline-none transition-colors" required>
                  <option value="" className="bg-card">Select a project type</option>
                  <option value="brand" className="bg-card">Brand Identity</option>
                  <option value="type" className="bg-card">Type Design</option>
                  <option value="packaging" className="bg-card">Packaging</option>
                  <option value="payment" className="bg-card">Payment Infrastructure</option>
                  <option value="other" className="bg-card">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono tracking-[0.2em] text-foreground/30 uppercase block mb-2">Message</label>
                <textarea value={formState.message} onChange={e => setFormState(s => ({ ...s, message: e.target.value }))} className="w-full bg-transparent border-b border-foreground/20 py-3 text-foreground font-mono text-sm focus:border-accent focus:outline-none transition-colors resize-none" rows={4} placeholder="Tell us about your project" required />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-8 py-4 bg-foreground text-background font-mono text-sm tracking-[0.15em] uppercase hover:bg-accent transition-colors">
                {submitted ? 'Message Sent ✓' : 'Send Message'}
              </motion.button>
            </motion.form>
          </div>
        </div>
      </div>

      <footer className="px-6 md:px-16 lg:px-24 py-8 border-t border-foreground/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-black tracking-tight">NKOLA<span className="text-accent">.</span></span>
          <span className="text-[10px] font-mono text-foreground/20">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </PageLayout>
  )
}

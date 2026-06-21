'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const talks = [
  {
    title: 'Designing for Financial Inclusion',
    event: 'Kampala Design Week 2024',
    date: 'March 2024',
    description: 'How type design and brand systems can make financial services more accessible in East Africa. A case study on the SACCO brand system and its impact on member trust and engagement.',
    videoId: 'dQw4w9WgXcQ',
    duration: '42:18',
  },
  {
    title: 'The Typography of Trust',
    event: 'AfricType Conference, Nairobi',
    date: 'November 2023',
    description: 'An exploration of how typeface design communicates credibility in financial contexts. From microfinance receipts to mobile banking interfaces, every letterform carries weight.',
    videoId: 'dQw4w9WgXcQ',
    duration: '38:45',
  },
  {
    title: 'Building Payment Infrastructure as Design',
    event: 'Fintech Summit Uganda',
    date: 'July 2023',
    description: 'When payment systems are designed with the same rigor as brand systems, the result is infrastructure that people actually trust. This talk bridges the gap between design thinking and systems architecture.',
    videoId: 'dQw4w9WgXcQ',
    duration: '51:30',
  },
]

export function LecturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="lectures" className="px-6 md:px-16 lg:px-24 py-24">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Lectures &amp; Talks</span>
        <h2 className="text-5xl md:text-7xl font-black tracking-[-0.03em] mt-4">
          Speaking
        </h2>
      </motion.div>

      <div className="space-y-16">
        {talks.map((talk, index) => (
          <TalkCard key={talk.title} talk={talk} index={index} />
        ))}
      </div>
    </section>
  )
}

function TalkCard({ talk, index }: { talk: typeof talks[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Video embed area */}
      <div className="lg:col-span-7">
        <div className="relative aspect-video bg-card border border-foreground/10 overflow-hidden group">
          {/* Simulated video embed with play button */}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/[0.03]">
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-foreground/30 flex items-center justify-center group-hover:border-accent transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 md:w-8 md:h-8 text-foreground/50 group-hover:text-accent ml-1 transition-colors"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.button>
              <span className="text-xs font-mono text-foreground/30 mt-3 block">{talk.duration}</span>
            </div>
          </div>
          {/* Film strip effect at top */}
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex-1 bg-foreground/5 mx-px" />
            ))}
          </div>
        </div>
      </div>

      {/* Talk details */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">{talk.date}</span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 leading-tight">
          {talk.title}
        </h3>
        <span className="text-sm font-mono text-accent/70 mt-2">{talk.event}</span>
        <p className="text-sm text-foreground/40 leading-relaxed mt-4">
          {talk.description}
        </p>
      </div>
    </motion.div>
  )
}

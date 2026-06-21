'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { PageLayout } from '@/components/portfolio/page-layout'

const specimens = [
  {
    name: 'Nkola Sans',
    weights: ['Light', 'Regular', 'Medium', 'Bold', 'Black'],
    sample: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz',
    numbers: '0123456789',
    glyphs: '!@#$%&*(){}[]<>',
    description: 'A variable typeface for financial interfaces. Open counters, generous x-height, and geometric DNA optimized for data tables and headlines.',
    color: '#EA580C',
  },
  {
    name: 'Nkola Serif',
    weights: ['Regular', 'Italic', 'Bold', 'Bold Italic'],
    sample: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
    numbers: '0123456789',
    glyphs: 'ﬁ ﬂ ﬃ ﬀ ﬄ æ œ ß',
    description: 'A contemporary serif with East African editorial sensibility. Designed for longform copy, specimen sheets, and print monographs.',
    color: '#52B788',
  },
  {
    name: 'Nkola Mono',
    weights: ['Regular', 'Bold'],
    sample: 'const payment = await verify(amount, ref)',
    numbers: '0123456789',
    glyphs: '{}[]()=><|&^%@$#',
    description: 'A monospace typeface built for code, data tables, and financial ledgers. Ligatures for common programming constructs.',
    color: '#F59E0B',
  },
]

function SpecimenCard({ specimen, index }: { specimen: typeof specimens[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotate: index % 2 === 0 ? -1 : 1 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-card border border-foreground/10 p-6 md:p-8 select-none">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{specimen.name}</h3>
            <div className="flex gap-2 mt-2">
              {specimen.weights.map(w => (
                <span key={w} className="text-[10px] font-mono px-2 py-0.5 bg-foreground/5 text-foreground/50 rounded">{w}</span>
              ))}
            </div>
          </div>
          <button
            className="text-[10px] font-mono tracking-[0.2em] uppercase px-3 py-1.5 border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
            onClick={(e) => { e.stopPropagation(); alert(`Downloading ${specimen.name} specimen PDF...`) }}
          >
            Download PDF
          </button>
        </div>
        <div className="mb-6 p-4 bg-foreground/[0.03] border border-foreground/5">
          <p className="text-2xl md:text-3xl leading-tight break-all" style={{ color: specimen.color }}>{specimen.sample}</p>
        </div>
        <div className="mb-4 p-3 bg-foreground/[0.03] border border-foreground/5">
          <p className="text-xl md:text-2xl font-mono tracking-wider" style={{ color: specimen.color }}>{specimen.numbers}</p>
        </div>
        <div className="mb-4 p-3 bg-foreground/[0.03] border border-foreground/5">
          <p className="text-lg md:text-xl font-mono" style={{ color: specimen.color + '99' }}>{specimen.glyphs}</p>
        </div>
        <p className="text-sm text-foreground/40 leading-relaxed">{specimen.description}</p>
      </div>
    </motion.div>
  )
}

export default function TypePage() {
  return (
    <PageLayout>
      <div className="pt-14">
        <div className="px-6 md:px-16 lg:px-24 pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Type Specimens</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.04em] mt-4">
              Type
            </h1>
            <p className="text-lg text-foreground/50 mt-4 max-w-md">
              Custom typefaces designed for East African financial interfaces. Drag specimens to rearrange. Download PDFs for full character sets.
            </p>
          </motion.div>
        </div>

        <div className="px-6 md:px-16 lg:px-24 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specimens.map((specimen, index) => (
              <SpecimenCard key={specimen.name} specimen={specimen} index={index} />
            ))}
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

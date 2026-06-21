'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

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
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotate: index % 2 === 0 ? -1 : 1 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
      className="relative"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-card border border-foreground/10 p-6 md:p-8 select-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{specimen.name}</h3>
            <div className="flex gap-2 mt-2">
              {specimen.weights.map(w => (
                <span key={w} className="text-[10px] font-mono px-2 py-0.5 bg-foreground/5 text-foreground/50 rounded">
                  {w}
                </span>
              ))}
            </div>
          </div>
          <button
            className="text-[10px] font-mono tracking-[0.2em] uppercase px-3 py-1.5 border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // In production, this would download a PDF
              alert(`Downloading ${specimen.name} specimen PDF...`)
            }}
          >
            Download PDF
          </button>
        </div>

        {/* Type sample - large */}
        <div className="mb-6 p-4 bg-foreground/[0.03] border border-foreground/5">
          <p className="text-2xl md:text-3xl leading-tight break-all" style={{ color: specimen.color }}>
            {specimen.sample}
          </p>
        </div>

        {/* Numbers */}
        <div className="mb-4 p-3 bg-foreground/[0.03] border border-foreground/5">
          <p className="text-xl md:text-2xl font-mono tracking-wider" style={{ color: specimen.color }}>
            {specimen.numbers}
          </p>
        </div>

        {/* Special glyphs */}
        <div className="mb-4 p-3 bg-foreground/[0.03] border border-foreground/5">
          <p className="text-lg md:text-xl font-mono" style={{ color: specimen.color + '99' }}>
            {specimen.glyphs}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/40 leading-relaxed">{specimen.description}</p>
      </div>
    </motion.div>
  )
}

export function TypeSpecimensSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="type-specimens" className="px-6 md:px-16 lg:px-24 py-24">
      {/* Section header */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Type Specimens</span>
        <h2 className="text-5xl md:text-7xl font-black tracking-[-0.03em] mt-4">
          Type<br />Systems
        </h2>
        <p className="text-lg text-foreground/50 mt-4 max-w-md">
          Custom typefaces designed for East African financial interfaces. Drag specimens to rearrange. Download PDFs for full character sets.
        </p>
      </motion.div>

      {/* Specimen cards - staggered layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {specimens.map((specimen, index) => (
          <SpecimenCard key={specimen.name} specimen={specimen} index={index} />
        ))}
      </div>
    </section>
  )
}

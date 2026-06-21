'use client'

import { motion } from 'framer-motion'

export function HeroSection() {
  const firstName = 'NKOLA'
  const lastName = 'STUDIO'

  const letterVariants = {
    hidden: { y: 120, opacity: 0, rotateX: -90 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        delay: 0.5 + i * 0.06,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  }

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { delay: 2, duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const subtitleVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 2.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30" />

      {/* Corner marks - editorial print reference */}
      <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-foreground/20" />
      <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-foreground/20" />
      <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-foreground/20" />
      <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-foreground/20" />

      <div className="relative z-10 px-6 md:px-16 lg:px-24">
        {/* Main typographic name treatment */}
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
                style={{ fontVariantNumeric: 'tabular-nums' }}
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
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Horizontal rule */}
        <motion.div
          variants={lineVariants}
          initial="hidden"
          animate="visible"
          className="h-px bg-foreground/40 mt-8 md:mt-12 origin-left"
        />

        {/* Subtitle row */}
        <motion.div
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
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

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-foreground/30 uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-px h-8 bg-foreground/20"
        />
      </motion.div>
    </section>
  )
}

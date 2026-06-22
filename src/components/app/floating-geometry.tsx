'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Deterministic positions for scattered dots — no Math.random() to avoid hydration mismatch
const DOT_CONFIGS = [
  { top: 12, left: 8, opacity: 0.08, yRange: 22, duration: 7, delay: 0 },
  { top: 25, left: 45, opacity: 0.06, yRange: 18, duration: 9, delay: 1 },
  { top: 38, left: 78, opacity: 0.09, yRange: 25, duration: 6, delay: 2 },
  { top: 55, left: 15, opacity: 0.05, yRange: 20, duration: 11, delay: 3 },
  { top: 68, left: 62, opacity: 0.07, yRange: 15, duration: 8, delay: 0.5 },
  { top: 80, left: 30, opacity: 0.06, yRange: 28, duration: 10, delay: 1.5 },
  { top: 15, left: 90, opacity: 0.08, yRange: 20, duration: 7.5, delay: 2.5 },
  { top: 45, left: 55, opacity: 0.05, yRange: 22, duration: 9.5, delay: 4 },
  { top: 72, left: 85, opacity: 0.07, yRange: 18, duration: 6.5, delay: 3.5 },
  { top: 30, left: 22, opacity: 0.06, yRange: 25, duration: 8.5, delay: 1 },
  { top: 60, left: 40, opacity: 0.09, yRange: 20, duration: 7, delay: 2 },
  { top: 88, left: 70, opacity: 0.05, yRange: 15, duration: 10.5, delay: 0.8 },
]

// Science/code/math symbols for floating background
const SYMBOLS = [
  // Math
  { char: 'π', label: 'pi' },
  { char: '∫', label: 'integral' },
  { char: '∑', label: 'sigma' },
  { char: '∂', label: 'partial' },
  { char: '∞', label: 'infinity' },
  { char: '∇', label: 'nabla' },
  { char: 'λ', label: 'lambda' },
  { char: 'Δ', label: 'delta' },
  // Code
  { char: '{ }', label: 'braces' },
  { char: '</>', label: 'html' },
  { char: '01', label: 'binary' },
  { char: 'fn', label: 'function' },
  { char: '=>', label: 'arrow' },
  { char: '//', label: 'comment' },
  // Bio
  { char: 'DNA', label: 'dna' },
  { char: 'ATCG', label: 'bases' },
  { char: 'Ω', label: 'ohm' },
  { char: 'α', label: 'alpha' },
]

// Floating science/code/math symbols that drift in the background
export function FloatingGeometry() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ perspective: '1200px' }}>
      {/* Floating π — top right */}
      <div className="geo-shape geo-cube flex items-center justify-center" style={{ top: '8%', right: '6%', width: '80px', height: '80px', fontSize: '2.5rem', color: 'oklch(0.72 0.19 155)' }}>
        π
      </div>

      {/* Floating ∫ — center left */}
      <div className="geo-shape geo-ring flex items-center justify-center" style={{ top: '30%', left: '4%', width: '100px', height: '100px', fontSize: '2.8rem', color: 'oklch(0.72 0.19 155)' }}>
        ∫
      </div>

      {/* Floating { } — bottom right */}
      <div className="geo-shape geo-diamond flex items-center justify-center" style={{ bottom: '12%', right: '10%', width: '70px', height: '70px', fontSize: '1.8rem', color: 'oklch(0.72 0.19 155)' }}>
        {'{ }'}
      </div>

      {/* Floating DNA — top left area */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ top: '18%', left: '25%', width: '90px', height: '50px', fontSize: '1.4rem', color: 'oklch(0.72 0.19 155)' }}
        animate={{ rotate: [0, 5, -5, 0], y: [-10, 10, -10] }}
        transition={{ rotate: { duration: 12, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        DNA
      </motion.div>

      {/* Floating ∑ — middle right */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ top: '55%', right: '8%', width: '70px', height: '70px', fontSize: '2.2rem', color: 'oklch(0.72 0.19 155)' }}
        animate={{ rotate: [0, 10, -10, 0], y: [-15, 15, -15], x: [-5, 5, -5] }}
        transition={{ rotate: { duration: 15, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 10, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
      >
        ∑
      </motion.div>

      {/* Floating ∇ — center area */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ top: '42%', left: '50%', width: '80px', height: '80px', fontSize: '2rem', color: 'oklch(0.72 0.19 155)' }}
        animate={{ rotateY: [0, 360], rotateX: [0, 15, 0, -15, 0] }}
        transition={{ rotateY: { duration: 30, repeat: Infinity, ease: 'linear' }, rotateX: { duration: 15, repeat: Infinity, ease: 'easeInOut' } }}
      >
        ∇
      </motion.div>

      {/* Floating </> — bottom left */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ bottom: '25%', left: '12%', width: '75px', height: '45px', fontSize: '1.6rem', color: 'oklch(0.72 0.19 155)' }}
        animate={{ y: [-8, 12, -8], rotate: [-3, 3, -3] }}
        transition={{ y: { duration: 9, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 11, repeat: Infinity, ease: 'easeInOut' } }}
      >
        &lt;/&gt;
      </motion.div>

      {/* Floating λ — middle area */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ top: '72%', left: '65%', width: '60px', height: '60px', fontSize: '2rem', color: 'oklch(0.72 0.19 155)' }}
        animate={{ y: [-12, 8, -12], rotateZ: [0, 15, -15, 0] }}
        transition={{ y: { duration: 7, repeat: Infinity, ease: 'easeInOut' }, rotateZ: { duration: 13, repeat: Infinity, ease: 'easeInOut' } }}
      >
        λ
      </motion.div>

      {/* Floating ∞ — upper center */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ top: '5%', left: '55%', width: '65px', height: '40px', fontSize: '1.8rem', color: 'oklch(0.72 0.19 155)' }}
        animate={{ y: [-5, 10, -5], x: [-3, 3, -3] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 9, repeat: Infinity, ease: 'easeInOut' } }}
      >
        ∞
      </motion.div>

      {/* Floating ATCG — lower center right */}
      <motion.div
        className="geo-shape flex items-center justify-center"
        style={{ bottom: '35%', right: '25%', width: '80px', height: '40px', fontSize: '1.1rem', color: 'oklch(0.72 0.19 155)', letterSpacing: '0.15em' }}
        animate={{ y: [-10, 15, -10], rotate: [-2, 2, -2] }}
        transition={{ y: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 14, repeat: Infinity, ease: 'easeInOut' } }}
      >
        ATCG
      </motion.div>

      {/* Small symbol dots — scattered (deterministic, no Math.random) */}
      {mounted && DOT_CONFIGS.map((cfg, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center justify-center font-mono"
          style={{
            top: `${cfg.top}%`,
            left: `${cfg.left}%`,
            opacity: 0,
            color: 'oklch(0.72 0.19 155)',
            fontSize: '0.7rem',
          }}
          animate={{
            y: [0, -cfg.yRange, 0],
            opacity: [0.03, cfg.opacity, 0.03],
          }}
          transition={{
            duration: cfg.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: cfg.delay,
          }}
        >
          {SYMBOLS[i % SYMBOLS.length].char}
        </motion.div>
      ))}
    </div>
  )
}

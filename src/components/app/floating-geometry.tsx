'use client'

import { motion } from 'framer-motion'

// Floating 3D geometric shapes that drift in the background
export function FloatingGeometry() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ perspective: '1200px' }}>
      {/* Rotating cube — top right */}
      <div className="geo-shape geo-cube" style={{ top: '10%', right: '8%', width: '80px', height: '80px' }}>
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <rect x="20" y="20" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      {/* Spinning ring — center left */}
      <div className="geo-shape geo-ring" style={{ top: '35%', left: '5%', width: '120px', height: '120px' }}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </div>

      {/* Orbiting diamond — bottom right */}
      <div className="geo-shape geo-diamond" style={{ bottom: '15%', right: '12%', width: '60px', height: '60px' }}>
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 5 L55 30 L30 55 L5 30 Z" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      {/* Slow rotating triangle — top left */}
      <motion.div
        className="geo-shape"
        style={{ top: '60%', left: '80%', width: '90px', height: '90px' }}
        animate={{ rotate: 360, y: [-10, 10, -10] }}
        transition={{ rotate: { duration: 35, repeat: Infinity, ease: 'linear' }, y: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 10 L80 75 L10 75 Z" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Floating hexagon — middle right */}
      <motion.div
        className="geo-shape"
        style={{ top: '70%', right: '40%', width: '70px', height: '70px' }}
        animate={{ rotate: -360, y: [-15, 15, -15], x: [-5, 5, -5] }}
        transition={{ rotate: { duration: 45, repeat: Infinity, ease: 'linear' }, y: { duration: 10, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <svg viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M35 5 L63 20 L63 50 L35 65 L7 50 L7 20 Z" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Wireframe sphere — center */}
      <motion.div
        className="geo-shape"
        style={{ top: '20%', left: '45%', width: '100px', height: '100px' }}
        animate={{ rotateY: 360, rotateX: [0, 15, 0, -15, 0] }}
        transition={{ rotateY: { duration: 30, repeat: Infinity, ease: 'linear' }, rotateX: { duration: 15, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="50" rx="45" ry="45" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <ellipse cx="50" cy="50" rx="45" ry="25" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <ellipse cx="50" cy="50" rx="25" ry="45" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </motion.div>

      {/* Small dots grid — scattered */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            opacity: 0.05 + Math.random() * 0.08,
          }}
          animate={{ 
            y: [0, -20 - Math.random() * 20, 0],
            opacity: [0.03, 0.1, 0.03],
          }}
          transition={{ 
            duration: 5 + Math.random() * 8, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

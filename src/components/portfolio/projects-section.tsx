'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

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

function LogoAnimation({ category, color }: { category: string; color: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const getLogoShape = () => {
    switch (category) {
      case 'Logo System':
        return (
          <motion.svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32">
            <motion.rect
              x="10" y="10" width="80" height="80"
              fill="none"
              stroke={color}
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="50" cy="50" r="25"
              fill={color}
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 0.8 } : {}}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.line
              x1="30" y1="50" x2="70" y2="50"
              stroke="oklch(0.13 0 0)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 1.2, duration: 0.5 }}
            />
          </motion.svg>
        )
      case 'Packaging':
        return (
          <motion.svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32">
            <motion.rect
              x="20" y="5" width="60" height="90" rx="4"
              fill="none"
              stroke={color}
              strokeWidth="2"
              initial={{ scaleY: 0, originY: 0, opacity: 0 }}
              animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.line
              x1="20" y1="35" x2="80" y2="35"
              stroke={color}
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
            <motion.rect
              x="35" y="50" width="30" height="10" rx="2"
              fill={color}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 0.6 } : {}}
              transition={{ delay: 1, duration: 0.4 }}
            />
          </motion.svg>
        )
      case 'Posters':
        return (
          <motion.svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32">
            <motion.text
              x="50" y="65"
              textAnchor="middle"
              fill={color}
              fontSize="60"
              fontWeight="900"
              fontFamily="var(--font-geist-sans)"
              initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
              animate={isInView ? { rotate: 0, scale: 1, opacity: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              A
            </motion.text>
          </motion.svg>
        )
      case 'Type Design':
        return (
          <motion.svg viewBox="0 0 100 100" className="w-24 h-24 md:w-32 md:h-32">
            <motion.path
              d="M 20 80 L 50 15 L 80 80"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <motion.line
              x1="30" y1="60" x2="70" y2="60"
              stroke={color}
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ delay: 1, duration: 0.5 }}
            />
          </motion.svg>
        )
      default:
        return null
    }
  }

  return <div ref={ref}>{getLogoShape()}</div>
}

function ProjectSpread({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex items-center"
    >
      <div className="w-full px-6 md:px-16 lg:px-24 py-20">
        {/* Project number */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xs font-mono tracking-[0.3em] text-foreground/30"
        >
          {String(index + 1).padStart(2, '0')} / {project.category.toUpperCase()}
        </motion.span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 mt-8">
          {/* Left: Visual / Logo */}
          <div className="lg:col-span-5 flex flex-col items-start gap-8">
            {/* Logo animation area */}
            <div
              className="w-full aspect-[4/3] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: project.colorPrimary + '15' }}
            >
              <LogoAnimation category={project.category} color={project.colorSecondary} />
              
              {/* Color palette strip at bottom */}
              <div className="absolute bottom-0 left-0 right-0 flex h-2">
                <div className="flex-1" style={{ backgroundColor: project.colorPrimary }} />
                <div className="flex-1" style={{ backgroundColor: project.colorSecondary }} />
                <div className="flex-1" style={{ backgroundColor: project.colorTertiary }} />
              </div>
            </div>

            {/* Color swatches */}
            <div className="flex gap-3">
              {[
                { color: project.colorPrimary, label: 'Primary' },
                { color: project.colorSecondary, label: 'Accent' },
                { color: project.colorTertiary, label: 'Base' },
              ].map((swatch) => (
                <div key={swatch.label} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-sm border border-foreground/10"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <span className="text-[10px] font-mono text-foreground/40">{swatch.color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Editorial copy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.95]">
                {project.title}
              </h2>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm font-mono text-foreground/50">{project.year}</span>
                <span className="w-8 h-px bg-foreground/20" />
                <span className="text-sm font-mono text-foreground/50">{project.category}</span>
              </div>
            </div>

            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-2xl">
              {project.description}
            </p>

            <div className="h-px bg-foreground/10 my-2" />

            <p className="text-base text-foreground/50 leading-[1.8] max-w-2xl">
              {project.editorial}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="relative">
      {/* Section header */}
      <div className="px-6 md:px-16 lg:px-24 pt-24 pb-8">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tracking-[0.3em] text-foreground/30 uppercase">Selected Work</span>
          <div className="flex-1 h-px bg-foreground/10" />
          <span className="text-xs font-mono text-foreground/30">{projects.length} Projects</span>
        </div>
      </div>

      {/* Project spreads */}
      {projects.map((project, index) => (
        <div key={project.id} className="relative">
          {/* Divider between projects */}
          {index > 0 && (
            <div className="px-6 md:px-16 lg:px-24">
              <div className="h-px bg-foreground/5" />
            </div>
          )}
          <ProjectSpread project={project} index={index} />
        </div>
      ))}
    </section>
  )
}

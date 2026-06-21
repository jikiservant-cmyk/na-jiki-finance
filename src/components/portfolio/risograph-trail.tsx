'use client'

import { useEffect, useRef, useCallback } from 'react'

export function RisographTrail() {
  const dotsRef = useRef<HTMLDivElement[]>([])
  const posRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)
  const DOT_COUNT = 12

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    // Create dot elements
    const container = document.createElement('div')
    container.id = 'risograph-trail'
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;'
    document.body.appendChild(container)

    const dots: HTMLDivElement[] = []
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('div')
      dot.className = 'risograph-dot'
      const size = Math.max(4, 10 - i * 0.5)
      dot.style.width = `${size}px`
      dot.style.height = `${size}px`
      dot.style.opacity = String(Math.max(0.05, 0.3 - i * 0.025))
      container.appendChild(dot)
      dots.push(dot)
    }

    const positions = dots.map(() => ({ x: 0, y: 0 }))

    const animate = () => {
      positions[0] = { ...posRef.current }
      for (let i = 1; i < positions.length; i++) {
        positions[i].x += (positions[i - 1].x - positions[i].x) * 0.3
        positions[i].y += (positions[i - 1].y - positions[i].y) * 0.3
      }
      dots.forEach((dot, i) => {
        dot.style.transform = `translate(${positions[i].x - 4}px, ${positions[i].y - 4}px)`
      })
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      container.remove()
    }
  }, [])

  return null
}

import { useEffect, type RefObject } from 'react'

interface EdgeAutoScrollOptions {
  enabled?: boolean
  edgeSizeRatio?: number
  maxSpeed?: number
  minSpeed?: number
}

function isFinePointer() {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function useEdgeAutoScroll<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  {
    enabled = true,
    edgeSizeRatio = 0.15,
    maxSpeed = 1.2,
    minSpeed = 0.25,
  }: EdgeAutoScrollOptions = {},
) {
  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return
    if (!isFinePointer()) return

    let frame = 0
    let speed = 0

    const tick = () => {
      if (speed !== 0) {
        const before = container.scrollTop
        container.scrollTop = before + speed
        if (container.scrollTop === before && Math.sign(speed) !== 0) {
          speed = 0
        }
      }
      frame = window.requestAnimationFrame(tick)
    }

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        speed = 0
        return
      }
      const rect = container.getBoundingClientRect()
      if (rect.height <= 0) {
        speed = 0
        return
      }
      const offset = event.clientY - rect.top
      if (offset < 0 || offset > rect.height) {
        speed = 0
        return
      }
      const edge = Math.max(24, rect.height * edgeSizeRatio)
      if (offset < edge) {
        const intensity = 1 - offset / edge
        speed = -(minSpeed + (maxSpeed - minSpeed) * intensity)
      } else if (offset > rect.height - edge) {
        const intensity = 1 - (rect.height - offset) / edge
        speed = minSpeed + (maxSpeed - minSpeed) * intensity
      } else {
        speed = 0
      }
    }

    const stop = () => {
      speed = 0
    }

    container.addEventListener('pointermove', handleMove)
    container.addEventListener('pointerleave', stop)
    container.addEventListener('pointerdown', stop)
    container.addEventListener('wheel', stop, { passive: true })

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
      container.removeEventListener('pointermove', handleMove)
      container.removeEventListener('pointerleave', stop)
      container.removeEventListener('pointerdown', stop)
      container.removeEventListener('wheel', stop)
    }
  }, [containerRef, enabled, edgeSizeRatio, maxSpeed, minSpeed])
}

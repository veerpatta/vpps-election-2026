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

function easeInQuad(t: number) {
  return t * t
}

export function useEdgeAutoScroll<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  {
    enabled = true,
    edgeSizeRatio = 0.18,
    maxSpeed = 1.6,
    minSpeed = 0.18,
  }: EdgeAutoScrollOptions = {},
) {
  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return
    if (!isFinePointer()) return

    let frame = 0
    let targetSpeed = 0
    let renderedSpeed = 0
    let pointerInside = false

    const tick = () => {
      // Smoothly lerp the rendered speed toward target for buttery feel
      renderedSpeed += (targetSpeed - renderedSpeed) * 0.18
      if (Math.abs(renderedSpeed) < 0.04 && targetSpeed === 0) {
        renderedSpeed = 0
      } else if (renderedSpeed !== 0) {
        const before = container.scrollTop
        container.scrollTop = before + renderedSpeed
        if (container.scrollTop === before && Math.sign(renderedSpeed) !== 0) {
          renderedSpeed = 0
          targetSpeed = 0
        }
      }
      frame = window.requestAnimationFrame(tick)
    }

    const computeSpeed = (clientY: number) => {
      const rect = container.getBoundingClientRect()
      if (rect.height <= 0) return 0
      const offset = clientY - rect.top
      if (offset < 0 || offset > rect.height) return 0
      const edge = Math.max(28, rect.height * edgeSizeRatio)
      if (offset < edge) {
        const intensity = easeInQuad(1 - offset / edge)
        return -(minSpeed + (maxSpeed - minSpeed) * intensity)
      }
      if (offset > rect.height - edge) {
        const intensity = easeInQuad(1 - (rect.height - offset) / edge)
        return minSpeed + (maxSpeed - minSpeed) * intensity
      }
      return 0
    }

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        targetSpeed = 0
        pointerInside = false
        return
      }
      pointerInside = true
      targetSpeed = computeSpeed(event.clientY)
    }

    const handleEnter = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      pointerInside = true
      targetSpeed = computeSpeed(event.clientY)
    }

    const stop = () => {
      pointerInside = false
      targetSpeed = 0
    }

    const handleWheel = () => {
      if (pointerInside) targetSpeed = 0
    }

    container.addEventListener('pointerenter', handleEnter)
    container.addEventListener('pointermove', handleMove)
    container.addEventListener('pointerleave', stop)
    container.addEventListener('pointerdown', stop)
    container.addEventListener('wheel', handleWheel, { passive: true })

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
      container.removeEventListener('pointerenter', handleEnter)
      container.removeEventListener('pointermove', handleMove)
      container.removeEventListener('pointerleave', stop)
      container.removeEventListener('pointerdown', stop)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [containerRef, enabled, edgeSizeRatio, maxSpeed, minSpeed])
}

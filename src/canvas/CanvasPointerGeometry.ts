import type { RefObject } from 'react'
import type { Point, Viewport } from './CanvasModel'

export function screenPoint(
  svgRef: RefObject<SVGSVGElement | null>,
  event: { clientX: number; clientY: number },
) {
  const rect = svgRef.current?.getBoundingClientRect()

  if (!rect) {
    return { x: 0, y: 0 }
  }

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

export function screenToWorld(point: Point, viewport: Viewport) {
  return {
    x: (point.x - viewport.x) / viewport.scale,
    y: (point.y - viewport.y) / viewport.scale,
  }
}

export function capturePointer(
  svgRef: RefObject<SVGSVGElement | null>,
  pointerId: number,
) {
  const svg = svgRef.current

  if (svg && !svg.hasPointerCapture(pointerId)) {
    svg.setPointerCapture(pointerId)
  }
}

export function releasePointer(
  svgRef: RefObject<SVGSVGElement | null>,
  pointerId: number,
) {
  const svg = svgRef.current

  if (svg?.hasPointerCapture(pointerId)) {
    svg.releasePointerCapture(pointerId)
  }
}

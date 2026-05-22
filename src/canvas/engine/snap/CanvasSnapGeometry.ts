import type { Bounds } from '../CanvasPrimitives'

export function translateCanvasSnapBounds(
  bounds: Bounds,
  dx: number,
  dy: number,
): Bounds {
  return {
    ...bounds,
    x: bounds.x + dx,
    y: bounds.y + dy,
  }
}

export function isCloserCanvasSnap(
  delta: number,
  snap: { delta: number } | null,
) {
  return !snap || Math.abs(delta) < Math.abs(snap.delta)
}

export function canvasSnapRangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return aStart <= bEnd && aEnd >= bStart
}

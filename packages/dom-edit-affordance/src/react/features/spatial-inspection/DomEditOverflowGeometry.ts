import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'

export function intersectDomEditOverflowRects(
  fullRect: DomEditOverlayRect,
  clipRect: DomEditOverlayRect,
): DomEditOverlayRect | null {
  const left = Math.max(fullRect.x, clipRect.x)
  const top = Math.max(fullRect.y, clipRect.y)
  const right = Math.min(fullRect.x + fullRect.w, clipRect.x + clipRect.w)
  const bottom = Math.min(fullRect.y + fullRect.h, clipRect.y + clipRect.h)

  if (right <= left || bottom <= top) {
    return null
  }

  return {
    h: bottom - top,
    w: right - left,
    x: left,
    y: top,
  }
}

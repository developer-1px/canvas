import type {
  Bounds,
} from '../../core'

export function insetBounds(bounds: Bounds, pad: number): Bounds {
  return {
    x: bounds.x + pad,
    y: bounds.y + pad,
    w: Math.max(bounds.w - pad * 2, 0),
    h: Math.max(bounds.h - pad * 2, 0),
  }
}

export function getUniformBoundsPad(outer: Bounds, inner: Bounds) {
  return Math.max(
    (outer.w - inner.w) / 2,
    (outer.h - inner.h) / 2,
    0,
  )
}

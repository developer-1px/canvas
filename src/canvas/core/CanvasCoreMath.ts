import type {
  Point,
} from './CanvasCoreTypes'

export const DRAG_THRESHOLD = 3

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

export function pointDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function unique<TId extends string>(ids: readonly TId[]): TId[] {
  return Array.from(new Set(ids))
}

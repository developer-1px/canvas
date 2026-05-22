import type { CanvasAffordanceConfig } from './CanvasAffordances'
import type { Bounds, Point } from './CanvasPrimitives'

const CANVAS_GRID_SIZE = 40

export function getCanvasGridSnap({
  proposed,
  threshold,
}: {
  proposed: Bounds
  threshold: number
}) {
  const dx =
    Math.round(proposed.x / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE - proposed.x
  const dy =
    Math.round(proposed.y / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE - proposed.y

  return {
    dx: Math.abs(dx) <= threshold ? dx : 0,
    dy: Math.abs(dy) <= threshold ? dy : 0,
  }
}

export function snapCanvasPointToGrid({
  config,
  point,
}: {
  config: CanvasAffordanceConfig
  point: Point
}): Point {
  if (!config.gestures.snapToGrid) {
    return point
  }

  return {
    x: Math.round(point.x / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE,
    y: Math.round(point.y / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE,
  }
}

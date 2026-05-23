import type { Point } from '../../entities'
import { pointDistance } from '../../core'
import type { CanvasDraftStrokeOverlay } from '../../engine'

const DRAWING_POINT_DISTANCE = 2

export function createCanvasDraftStroke(
  kind: CanvasDraftStrokeOverlay['kind'],
  points: Point[],
): CanvasDraftStrokeOverlay {
  return kind === 'marker'
    ? {
        kind,
        opacity: 1,
        points,
        stroke: '#475569',
        strokeWidth: 4,
      }
    : {
        kind,
        opacity: 0.42,
        points,
        stroke: '#fde047',
        strokeWidth: 18,
      }
}

export function getNextCanvasDrawingPoints({
  currentWorld,
  points,
  shiftKey,
  startWorld,
}: {
  currentWorld: Point
  points: Point[]
  shiftKey: boolean
  startWorld: Point
}) {
  if (shiftKey) {
    return [startWorld, currentWorld]
  }

  const lastPoint = points[points.length - 1]

  if (!lastPoint || pointDistance(lastPoint, currentWorld) < DRAWING_POINT_DISTANCE) {
    return points
  }

  return [...points, currentWorld]
}

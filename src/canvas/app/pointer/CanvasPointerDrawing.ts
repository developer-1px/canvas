import type { Point } from '../../entities'
import { pointDistance } from '../../core'
import type { CanvasDraftStrokeOverlay } from '../../engine'
import {
  getCanvasDrawingStrokeStyle,
  type CanvasDrawingStrokeKind,
} from '../../host'

const DRAWING_POINT_DISTANCE = 2

export function createCanvasDraftStroke(
  kind: CanvasDrawingStrokeKind,
  points: Point[],
): CanvasDraftStrokeOverlay {
  return {
    kind,
    points,
    ...getCanvasDrawingStrokeStyle(kind),
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

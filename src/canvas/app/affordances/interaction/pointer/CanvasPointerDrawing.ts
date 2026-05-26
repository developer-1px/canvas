import type { Point } from '../../../../entities'
import { pointDistance } from '../../../../core'
import type { CanvasDraftStrokeOverlay } from '../../../../engine'
import {
  getCanvasDrawingStrokeStyle,
  type CanvasDrawingStrokeStyle,
  type CanvasDrawingStrokeKind,
} from '../../../../host'

const DRAWING_POINT_DISTANCE = 2

export function createCanvasDraftStroke(
  kind: CanvasDrawingStrokeKind,
  points: Point[],
  style: CanvasDrawingStrokeStyle = getCanvasDrawingStrokeStyle(kind),
): CanvasDraftStrokeOverlay {
  return {
    kind,
    points,
    ...style,
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

import type {
  Point,
} from '../../core'
import type {
  CanvasCreatedPathSegment,
} from './CanvasCreationContracts'

const DEFAULT_DRAWING_OFFSET = {
  x: 80,
  y: 0,
}

export function getCanvasCreatedDrawingPoints({
  points,
  startWorld,
}: {
  points: Point[]
  startWorld: Point
}): Point[] {
  if (points.length > 1) {
    return points
  }

  return [
    startWorld,
    {
      x: startWorld.x + DEFAULT_DRAWING_OFFSET.x,
      y: startWorld.y + DEFAULT_DRAWING_OFFSET.y,
    },
  ]
}

export function getCanvasCreatedPathSegments({
  points,
  startWorld,
}: {
  points: Point[]
  startWorld: Point
}): CanvasCreatedPathSegment[] {
  const pathPoints = points.length > 1
    ? points
    : [
        startWorld,
        { x: startWorld.x + 48, y: startWorld.y - 32 },
        { x: startWorld.x + 104, y: startWorld.y + 32 },
        { x: startWorld.x + 152, y: startWorld.y },
      ]
  const [start, second] = pathPoints

  if (!start || !second) {
    return []
  }

  if (pathPoints.length < 3) {
    return [
      { point: start, type: 'move' },
      { point: second, type: 'line' },
    ]
  }

  const end = pathPoints[pathPoints.length - 1]
  const control1 = pathPoints[Math.floor((pathPoints.length - 1) / 3)]
  const control2 = pathPoints[Math.floor((pathPoints.length - 1) * 2 / 3)]

  return [
    { point: start, type: 'move' },
    {
      control1,
      control2,
      point: end,
      type: 'cubic',
    },
  ]
}

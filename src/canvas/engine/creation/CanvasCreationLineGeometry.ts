import type {
  Point,
} from '../../core'
import {
  pointDistance,
} from '../primitives/CanvasPrimitives'

export type CanvasAngleConstrainedLineEndPointInput = {
  currentWorld: Point
  startWorld: Point
}

export const CANVAS_ANGLE_CONSTRAINED_LINE_ENDPOINT_MODEL =
  'canvas-angle-constrained-line-endpoint'

const DEFAULT_ARROW_OFFSET = {
  x: 144,
  y: 0,
}

export function getCanvasAngleConstrainedLineEndPoint({
  currentWorld,
  startWorld,
}: CanvasAngleConstrainedLineEndPointInput): Point {
  const distance = pointDistance(startWorld, currentWorld)

  if (distance === 0) {
    return currentWorld
  }

  const angleStep = Math.PI / 4
  const angle = Math.atan2(
    currentWorld.y - startWorld.y,
    currentWorld.x - startWorld.x,
  )
  const constrainedAngle = Math.round(angle / angleStep) * angleStep

  return {
    x: startWorld.x + Math.cos(constrainedAngle) * distance,
    y: startWorld.y + Math.sin(constrainedAngle) * distance,
  }
}

export function getCanvasCreatedArrowEnd({
  constrainAngle = false,
  currentWorld,
  startWorld,
}: {
  constrainAngle?: boolean
  currentWorld: Point
  startWorld: Point
}): Point {
  if (pointDistance(startWorld, currentWorld) > 6) {
    return constrainAngle
      ? getCanvasAngleConstrainedLineEndPoint({ currentWorld, startWorld })
      : currentWorld
  }

  return {
    x: startWorld.x + DEFAULT_ARROW_OFFSET.x,
    y: startWorld.y + DEFAULT_ARROW_OFFSET.y,
  }
}

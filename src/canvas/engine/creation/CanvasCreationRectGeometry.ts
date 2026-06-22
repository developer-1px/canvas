import type {
  Bounds,
  Point,
} from '../../core'
import {
  normalizeBounds,
} from '../primitives/CanvasPrimitives'

export type CanvasCreatedRectSize = Readonly<{
  h: number
  w: number
}>

export type CanvasCreatedRectBoundsInput = {
  currentWorld: Point
  defaultSize?: CanvasCreatedRectSize
  dragThreshold?: number
  preserveAspectRatio?: boolean
  resizeFromCenter?: boolean
  startWorld: Point
}

export type CanvasAspectLockedCreationPointInput = {
  currentWorld: Point
  startWorld: Point
}

export type CanvasCenterOutCreationPointsInput = {
  currentWorld: Point
  startWorld: Point
}

export type CanvasCenterOutCreationPoints = Readonly<{
  current: Point
  start: Point
}>

export const CANVAS_CENTER_OUT_CREATION_POINTS_MODEL =
  'canvas-center-out-creation-points'
export const CANVAS_CREATED_RECT_BOUNDS_MODEL = 'canvas-created-rect-bounds'

const DEFAULT_RECT_SIZE = {
  w: 168,
  h: 112,
}
const DEFAULT_RECT_DRAG_THRESHOLD = 6

export function getCanvasCreatedRectBounds({
  currentWorld,
  defaultSize = DEFAULT_RECT_SIZE,
  dragThreshold = DEFAULT_RECT_DRAG_THRESHOLD,
  preserveAspectRatio = false,
  resizeFromCenter = false,
  startWorld,
}: CanvasCreatedRectBoundsInput): Bounds {
  const rawBounds = normalizeBounds(startWorld, currentWorld)

  if (rawBounds.w > dragThreshold && rawBounds.h > dragThreshold) {
    const effectiveCurrent = preserveAspectRatio
      ? getCanvasAspectLockedCreationPoint({ currentWorld, startWorld })
      : currentWorld
    const creationPoints = resizeFromCenter
      ? getCanvasCenterOutCreationPoints({
        currentWorld: effectiveCurrent,
        startWorld,
      })
      : {
          current: effectiveCurrent,
          start: startWorld,
        }

    return normalizeBounds(creationPoints.start, creationPoints.current)
  }

  return resizeFromCenter
    ? {
        h: defaultSize.h,
        w: defaultSize.w,
        x: startWorld.x - defaultSize.w / 2,
        y: startWorld.y - defaultSize.h / 2,
      }
    : {
        x: startWorld.x,
        y: startWorld.y,
        ...defaultSize,
      }
}

export function getCanvasAspectLockedCreationPoint({
  currentWorld,
  startWorld,
}: CanvasAspectLockedCreationPointInput): Point {
  const dx = currentWorld.x - startWorld.x
  const dy = currentWorld.y - startWorld.y
  const size = Math.max(Math.abs(dx), Math.abs(dy))

  return {
    x: startWorld.x + getCanvasCreationDirectionSign(dx) * size,
    y: startWorld.y + getCanvasCreationDirectionSign(dy) * size,
  }
}

export function getCanvasCenterOutCreationPoints({
  currentWorld,
  startWorld,
}: CanvasCenterOutCreationPointsInput): CanvasCenterOutCreationPoints {
  const dx = currentWorld.x - startWorld.x
  const dy = currentWorld.y - startWorld.y

  return {
    current: currentWorld,
    start: {
      x: startWorld.x - dx,
      y: startWorld.y - dy,
    },
  }
}

function getCanvasCreationDirectionSign(value: number) {
  return value < 0 ? -1 : 1
}

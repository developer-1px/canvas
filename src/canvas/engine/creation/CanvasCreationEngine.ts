import type {
  Bounds,
  Point
} from '../../core'
import type {
  CanvasPathSegment,
  CanvasShapeKind,
} from '../../entities'
import {
  normalizeBounds,
  pointDistance,
} from '../primitives/CanvasPrimitives'

export type CanvasCreationItem = {
  id: string
}

export type CanvasCreatedText<TItem extends CanvasCreationItem> = {
  item: TItem
  editValue: string
}

export type CanvasCreatedArrowRouting = 'elbow' | 'straight'

export type CanvasCreatedShapeKind = CanvasShapeKind

export type CanvasCreatedDrawingStyle = Readonly<{
  opacity: number
  stroke: string
  strokeWidth: number
}>

export type CanvasCreatedPathSegment = CanvasPathSegment

export type CanvasCreationAdapter<TItem extends CanvasCreationItem> = {
  createArrow: (input: {
    end: Point
    endAttachedTo?: string
    id: string
    routing?: CanvasCreatedArrowRouting
    start: Point
    startAttachedTo?: string
  }) => TItem
  createHighlight: (input: {
    id: string
    points: Point[]
    style?: CanvasCreatedDrawingStyle
  }) => TItem
  createMarker: (input: {
    id: string
    points: Point[]
    style?: CanvasCreatedDrawingStyle
  }) => TItem
  createPath?: (input: {
    id: string
    segments: CanvasCreatedPathSegment[]
    style?: CanvasCreatedDrawingStyle
  }) => TItem
  createShape?: (input: {
    bounds: Bounds
    id: string
    shapeType: CanvasCreatedShapeKind
  }) => TItem
  createRect?: (input: {
    bounds: Bounds
    id: string
    shape?: CanvasCreatedShapeKind
  }) => TItem
  createText: (input: { id: string; point: Point }) => CanvasCreatedText<TItem>
}

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

export type CanvasAngleConstrainedLineEndPointInput = {
  currentWorld: Point
  startWorld: Point
}

export const CANVAS_CENTER_OUT_CREATION_POINTS_MODEL =
  'canvas-center-out-creation-points'
export const CANVAS_ANGLE_CONSTRAINED_LINE_ENDPOINT_MODEL =
  'canvas-angle-constrained-line-endpoint'
export const CANVAS_CREATED_RECT_BOUNDS_MODEL = 'canvas-created-rect-bounds'

const DEFAULT_RECT_SIZE = {
  w: 168,
  h: 112,
}
const DEFAULT_RECT_DRAG_THRESHOLD = 6

const DEFAULT_ARROW_OFFSET = {
  x: 144,
  y: 0,
}

const DEFAULT_DRAWING_OFFSET = {
  x: 80,
  y: 0,
}

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

export function getCanvasAngleConstrainedLineEndPoint({
  currentWorld,
  startWorld,
}: CanvasAngleConstrainedLineEndPointInput): Point {
  const distance = pointDistance(startWorld, currentWorld)

  if (distance === 0) {
    return currentWorld
  }

  const angleStep = Math.PI / 4
  const angle = Math.atan2(currentWorld.y - startWorld.y, currentWorld.x - startWorld.x)
  const constrainedAngle = Math.round(angle / angleStep) * angleStep

  return {
    x: startWorld.x + Math.cos(constrainedAngle) * distance,
    y: startWorld.y + Math.sin(constrainedAngle) * distance,
  }
}

function getCanvasCreationDirectionSign(value: number) {
  return value < 0 ? -1 : 1
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

export function createCanvasShape<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  currentWorld,
  preserveAspectRatio = false,
  resizeFromCenter = false,
  shapeType = 'rect',
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  currentWorld: Point
  preserveAspectRatio?: boolean
  resizeFromCenter?: boolean
  shapeType?: CanvasCreatedShapeKind
  startWorld: Point
}) {
  const bounds = getCanvasCreatedRectBounds({
    currentWorld,
    preserveAspectRatio,
    resizeFromCenter,
    startWorld,
  })

  if (adapter.createShape) {
    return adapter.createShape({
      bounds,
      id: createId(shapeType),
      shapeType,
    })
  }

  if (adapter.createRect) {
    return adapter.createRect({
      bounds,
      id: createId(shapeType),
      shape: shapeType === 'rect' ? undefined : shapeType,
    })
  }

  throw new Error('Canvas creation adapter requires createShape')
}

export function createCanvasRect<TItem extends CanvasCreationItem>({
  shape,
  ...input
}: Omit<Parameters<typeof createCanvasShape<TItem>>[0], 'shapeType'> & {
  shape?: CanvasCreatedShapeKind
}) {
  return createCanvasShape({
    ...input,
    shapeType: shape,
  })
}

export function createCanvasHighlight<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  points,
  startWorld,
  style,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  points: Point[]
  startWorld: Point
  style?: CanvasCreatedDrawingStyle
}) {
  return adapter.createHighlight({
    id: createId('highlight'),
    points: getCanvasCreatedDrawingPoints({ points, startWorld }),
    style,
  })
}

export function createCanvasMarker<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  points,
  startWorld,
  style,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  points: Point[]
  startWorld: Point
  style?: CanvasCreatedDrawingStyle
}) {
  return adapter.createMarker({
    id: createId('marker'),
    points: getCanvasCreatedDrawingPoints({ points, startWorld }),
    style,
  })
}

export function createCanvasPath<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  points,
  startWorld,
  style,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  points: Point[]
  startWorld: Point
  style?: CanvasCreatedDrawingStyle
}) {
  if (!adapter.createPath) {
    throw new Error('Canvas creation adapter requires createPath')
  }

  return adapter.createPath({
    id: createId('path'),
    segments: getCanvasCreatedPathSegments({ points, startWorld }),
    style,
  })
}

export function createCanvasArrow<TItem extends CanvasCreationItem>({
  adapter,
  constrainAngle = false,
  createId,
  currentWorld,
  endAttachedTo,
  startAttachedTo,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  constrainAngle?: boolean
  createId: (prefix: string) => string
  currentWorld: Point
  endAttachedTo?: string
  startAttachedTo?: string
  startWorld: Point
}) {
  return adapter.createArrow({
    end: getCanvasCreatedArrowEnd({
      constrainAngle,
      currentWorld,
      startWorld,
    }),
    endAttachedTo,
    id: createId('arrow'),
    routing: 'elbow',
    start: startWorld,
    startAttachedTo,
  })
}

export function createCanvasText<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  point,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  point: Point
}) {
  return adapter.createText({
    id: createId('text'),
    point,
  })
}

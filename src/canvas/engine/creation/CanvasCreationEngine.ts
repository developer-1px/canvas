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

export type CanvasCreatedRectBoundsInput = {
  currentWorld: Point
  preserveAspectRatio?: boolean
  resizeFromCenter?: boolean
  startWorld: Point
}

export type CanvasCreatedArrowEndInput = {
  constrainAngle?: boolean
  currentWorld: Point
  startWorld: Point
}

export type CanvasAspectRatioLockedPointInput = {
  currentWorld: Point
  startWorld: Point
}

export type CanvasAngleConstrainedPointInput = {
  angleStepDegrees?: number
  currentWorld: Point
  startWorld: Point
}

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

const DEFAULT_RECT_SIZE = {
  w: 168,
  h: 112,
}

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
  preserveAspectRatio = false,
  resizeFromCenter = false,
  startWorld,
}: CanvasCreatedRectBoundsInput): Bounds {
  const endWorld = preserveAspectRatio
    ? getCanvasAspectRatioLockedPoint({ currentWorld, startWorld })
    : currentWorld
  const rawBounds = resizeFromCenter
    ? normalizeBounds(getCanvasMirrorPoint(startWorld, endWorld), endWorld)
    : normalizeBounds(startWorld, endWorld)

  if (rawBounds.w > 6 && rawBounds.h > 6) {
    return rawBounds
  }

  return resizeFromCenter
    ? {
        x: startWorld.x - DEFAULT_RECT_SIZE.w / 2,
        y: startWorld.y - DEFAULT_RECT_SIZE.h / 2,
        ...DEFAULT_RECT_SIZE,
      }
    : {
        x: startWorld.x,
        y: startWorld.y,
        ...DEFAULT_RECT_SIZE,
      }
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
}: CanvasCreatedArrowEndInput): Point {
  if (pointDistance(startWorld, currentWorld) > 6) {
    return constrainAngle
      ? getCanvasAngleConstrainedPoint({ currentWorld, startWorld })
      : currentWorld
  }

  return {
    x: startWorld.x + DEFAULT_ARROW_OFFSET.x,
    y: startWorld.y + DEFAULT_ARROW_OFFSET.y,
  }
}

export function getCanvasAspectRatioLockedPoint({
  currentWorld,
  startWorld,
}: CanvasAspectRatioLockedPointInput): Point {
  const dx = currentWorld.x - startWorld.x
  const dy = currentWorld.y - startWorld.y
  const size = Math.max(Math.abs(dx), Math.abs(dy))

  return {
    x: startWorld.x + Math.sign(dx || 1) * size,
    y: startWorld.y + Math.sign(dy || 1) * size,
  }
}

export function getCanvasAngleConstrainedPoint({
  angleStepDegrees = 45,
  currentWorld,
  startWorld,
}: CanvasAngleConstrainedPointInput): Point {
  const dx = currentWorld.x - startWorld.x
  const dy = currentWorld.y - startWorld.y

  if (dx === 0 && dy === 0) {
    return currentWorld
  }

  const stepRadians = angleStepDegrees * (Math.PI / 180)
  const angle = Math.atan2(dy, dx)
  const snappedAngle = Math.round(angle / stepRadians) * stepRadians
  const unit = {
    x: Math.cos(snappedAngle),
    y: Math.sin(snappedAngle),
  }
  const dominantDelta = Math.max(Math.abs(dx), Math.abs(dy))
  const dominantUnit = Math.max(Math.abs(unit.x), Math.abs(unit.y))
  const length = dominantUnit === 0
    ? dominantDelta
    : dominantDelta / dominantUnit

  return {
    x: roundCanvasCreationCoordinate(startWorld.x + unit.x * length),
    y: roundCanvasCreationCoordinate(startWorld.y + unit.y * length),
  }
}

function getCanvasMirrorPoint(origin: Point, point: Point): Point {
  return {
    x: origin.x - (point.x - origin.x),
    y: origin.y - (point.y - origin.y),
  }
}

function roundCanvasCreationCoordinate(value: number) {
  return Number(value.toFixed(6))
}

export function createCanvasShape<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  currentWorld,
  preserveAspectRatio,
  resizeFromCenter,
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
  createId,
  currentWorld,
  constrainAngle,
  endAttachedTo,
  startAttachedTo,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  constrainAngle?: boolean
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

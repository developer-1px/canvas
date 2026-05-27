import type {
  Bounds,
  Point
} from '../../core'
import type { CanvasShapeKind } from '../../entities'
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
  startWorld,
}: {
  currentWorld: Point
  startWorld: Point
}): Bounds {
  const rawBounds = normalizeBounds(startWorld, currentWorld)

  if (rawBounds.w > 6 && rawBounds.h > 6) {
    return rawBounds
  }

  return {
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

export function getCanvasCreatedArrowEnd({
  currentWorld,
  startWorld,
}: {
  currentWorld: Point
  startWorld: Point
}): Point {
  if (pointDistance(startWorld, currentWorld) > 6) {
    return currentWorld
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
  shapeType = 'rect',
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  currentWorld: Point
  shapeType?: CanvasCreatedShapeKind
  startWorld: Point
}) {
  const bounds = getCanvasCreatedRectBounds({ currentWorld, startWorld })

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

export function createCanvasArrow<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  currentWorld,
  endAttachedTo,
  startAttachedTo,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  currentWorld: Point
  endAttachedTo?: string
  startAttachedTo?: string
  startWorld: Point
}) {
  return adapter.createArrow({
    end: getCanvasCreatedArrowEnd({ currentWorld, startWorld }),
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

import type {
  Point,
} from '../../core'
import type {
  CanvasCreatedDrawingStyle,
  CanvasCreatedShapeKind,
  CanvasCreationAdapter,
  CanvasCreationItem,
} from './CanvasCreationContracts'
import {
  getCanvasCreatedDrawingPoints,
  getCanvasCreatedPathSegments,
} from './CanvasCreationDrawingGeometry'
import {
  getCanvasCreatedArrowEnd,
} from './CanvasCreationLineGeometry'
import {
  getCanvasCreatedRectBounds,
} from './CanvasCreationRectGeometry'

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

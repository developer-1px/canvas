import type {
  Bounds,
  Point
} from '../../core'
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

export type CanvasCreationAdapter<TItem extends CanvasCreationItem> = {
  createArrow: (input: { end: Point; id: string; start: Point }) => TItem
  createHighlight: (input: { id: string; points: Point[] }) => TItem
  createMarker: (input: { id: string; points: Point[] }) => TItem
  createRect: (input: { bounds: Bounds; id: string }) => TItem
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

export function createCanvasRect<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  currentWorld,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  currentWorld: Point
  startWorld: Point
}) {
  return adapter.createRect({
    bounds: getCanvasCreatedRectBounds({ currentWorld, startWorld }),
    id: createId('rect'),
  })
}

export function createCanvasHighlight<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  points,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  points: Point[]
  startWorld: Point
}) {
  return adapter.createHighlight({
    id: createId('highlight'),
    points: getCanvasCreatedDrawingPoints({ points, startWorld }),
  })
}

export function createCanvasMarker<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  points,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  points: Point[]
  startWorld: Point
}) {
  return adapter.createMarker({
    id: createId('marker'),
    points: getCanvasCreatedDrawingPoints({ points, startWorld }),
  })
}

export function createCanvasArrow<TItem extends CanvasCreationItem>({
  adapter,
  createId,
  currentWorld,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  currentWorld: Point
  startWorld: Point
}) {
  return adapter.createArrow({
    end: getCanvasCreatedArrowEnd({ currentWorld, startWorld }),
    id: createId('arrow'),
    start: startWorld,
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

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
  createHighlight: (input: { bounds: Bounds; id: string }) => TItem
  createRect: (input: { bounds: Bounds; id: string }) => TItem
  createText: (input: { id: string; point: Point }) => CanvasCreatedText<TItem>
}

const DEFAULT_RECT_SIZE = {
  w: 168,
  h: 112,
}

const DEFAULT_HIGHLIGHT_SIZE = {
  w: 220,
  h: 42,
}

const DEFAULT_ARROW_OFFSET = {
  x: 144,
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

export function getCanvasCreatedHighlightBounds({
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
    ...DEFAULT_HIGHLIGHT_SIZE,
  }
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
  currentWorld,
  startWorld,
}: {
  adapter: CanvasCreationAdapter<TItem>
  createId: (prefix: string) => string
  currentWorld: Point
  startWorld: Point
}) {
  return adapter.createHighlight({
    bounds: getCanvasCreatedHighlightBounds({ currentWorld, startWorld }),
    id: createId('highlight'),
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

import { normalizeBounds, type Bounds, type Point } from './CanvasModel'

export type CanvasCreationItem = {
  id: string
}

export type CanvasCreatedText<TItem extends CanvasCreationItem> = {
  item: TItem
  editValue: string
}

export type CanvasCreationAdapter<TItem extends CanvasCreationItem> = {
  createRect: (input: { bounds: Bounds; id: string }) => TItem
  createText: (input: { id: string; point: Point }) => CanvasCreatedText<TItem>
}

const DEFAULT_RECT_SIZE = {
  w: 168,
  h: 112,
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

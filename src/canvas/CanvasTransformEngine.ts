import {
  resizeBounds,
  type Bounds,
  type Point,
  type ResizeHandle,
} from './CanvasModel'

export type CanvasTransformItem = {
  id: string
}

export type CanvasTransformAdapter<TItem extends CanvasTransformItem> = {
  resizeSelection: (input: {
    from: Bounds
    items: TItem[]
    selection: string[]
    to: Bounds
  }) => TItem[]
  translateSelection: (input: {
    dx: number
    dy: number
    items: TItem[]
    selection: string[]
  }) => TItem[]
}

export function moveCanvasSelection<TItem extends CanvasTransformItem>({
  adapter,
  dx,
  dy,
  items,
  selection,
}: {
  adapter: CanvasTransformAdapter<TItem>
  dx: number
  dy: number
  items: TItem[]
  selection: string[]
}) {
  return adapter.translateSelection({ dx, dy, items, selection })
}

export function resizeCanvasSelection<TItem extends CanvasTransformItem>({
  adapter,
  bounds,
  handle,
  items,
  point,
  selection,
}: {
  adapter: CanvasTransformAdapter<TItem>
  bounds: Bounds
  handle: ResizeHandle
  items: TItem[]
  point: Point
  selection: string[]
}) {
  return adapter.resizeSelection({
    from: bounds,
    items,
    selection,
    to: resizeBounds(bounds, handle, point),
  })
}

import type {
  Bounds,
  Point,
  ResizeHandle
} from '../core'
import {
  resizeBounds,
  scaleItemBounds,
  type ResizeBoundsOptions,
} from '../core'
import { mapCanvasSelectionItems } from './CanvasSelectionItems'

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

export type CanvasSelectionBoundsTransformInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemBounds: (item: TItem, index: number) => Bounds
  getItemId: (item: TItem, index: number) => TItemId
  isItemTransformable?: (item: TItem, index: number) => boolean
  items: TItem[]
  selection: readonly TItemId[]
  updateItemBounds: (item: TItem, bounds: Bounds, index: number) => TItem
}

export type CanvasSelectionBoundsResizeInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionBoundsTransformInput<TItem, TItemId> & {
  from: Bounds
  to: Bounds
}

export type CanvasSelectionBoundsTranslateInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionBoundsTransformInput<TItem, TItemId> & {
  dx: number
  dy: number
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
  preserveAspectRatio,
  resizeFromCenter,
  selection,
}: {
  adapter: CanvasTransformAdapter<TItem>
  bounds: Bounds
  handle: ResizeHandle
  items: TItem[]
  point: Point
  preserveAspectRatio?: boolean
  resizeFromCenter?: boolean
  selection: string[]
}) {
  return adapter.resizeSelection({
    from: bounds,
    items,
    selection,
    to: resizeBounds(bounds, handle, point, {
      preserveAspectRatio,
      resizeFromCenter,
    } satisfies ResizeBoundsOptions),
  })
}

export function resizeCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  from,
  getItemBounds,
  getItemId,
  isItemTransformable,
  items,
  selection,
  to,
  updateItemBounds,
}: CanvasSelectionBoundsResizeInput<TItem, TItemId>) {
  return mapCanvasSelectionItems({
    getItemId,
    isItemSelectable: isItemTransformable,
    items,
    mapItem: (item, index) =>
      updateItemBounds(
        item,
        scaleItemBounds(getItemBounds(item, index), from, to),
        index,
      ),
    selection,
  })
}

export function translateCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  dx,
  dy,
  getItemBounds,
  getItemId,
  isItemTransformable,
  items,
  selection,
  updateItemBounds,
}: CanvasSelectionBoundsTranslateInput<TItem, TItemId>) {
  return mapCanvasSelectionItems({
    getItemId,
    isItemSelectable: isItemTransformable,
    items,
    mapItem: (item, index) => {
      const bounds = getItemBounds(item, index)

      return updateItemBounds(item, {
        ...bounds,
        x: bounds.x + dx,
        y: bounds.y + dy,
      }, index)
    },
    selection,
  })
}

export function normalizeCanvasRotationDegrees(
  rotation: number | null | undefined,
) {
  if (rotation === null || rotation === undefined || !Number.isFinite(rotation)) {
    return 0
  }

  const normalized = ((rotation % 360) + 360) % 360
  const rounded = Number(normalized.toFixed(3))

  return rounded >= 360 || Math.abs(rounded) < 0.001 ? 0 : rounded
}

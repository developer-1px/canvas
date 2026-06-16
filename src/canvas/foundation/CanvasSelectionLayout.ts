import type { Bounds } from '../core'
import { unionCanvasRectList } from './CanvasHeadlessGeometry'

export type CanvasSelectionLayoutAxis = 'horizontal' | 'vertical'

export type CanvasSelectionLayoutInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemBounds: (item: TItem, index: number) => Bounds
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
}

export type CanvasSelectionLayoutChangeInput<
  TItem,
  TItemId extends string = string,
> = Omit<CanvasSelectionLayoutInput<TItem, TItemId>, 'items'> & {
  items: TItem[]
  updateItemBounds: (item: TItem, bounds: Bounds, index: number) => TItem
}

export type CanvasSelectionFlipInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  axis: CanvasSelectionLayoutAxis
  flipItem?: (input: CanvasSelectionFlipItemInput<TItem, TItemId>) => TItem
}

export type CanvasSelectionFlipItemInput<
  TItem,
  TItemId extends string = string,
> = {
  axis: CanvasSelectionLayoutAxis
  bounds: Bounds
  id: TItemId
  index: number
  item: TItem
  pivot: number
  reflectedBounds: Bounds
  selectionBounds: Bounds
}

export type CanvasSelectionTidyInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  gap?: number
}

type CanvasSelectionLayoutEntry<
  TItem,
  TItemId extends string = string,
> = {
  bounds: Bounds
  id: TItemId
  index: number
  item: TItem
}

export function canFlipCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>(input: CanvasSelectionLayoutInput<TItem, TItemId>) {
  return getSelectedCanvasSelectionLayoutEntries(input, 1) !== null
}

export function flipCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  axis,
  flipItem,
  updateItemBounds,
  ...input
}: CanvasSelectionFlipInput<TItem, TItemId>): TItem[] {
  const selected = getSelectedCanvasSelectionLayoutEntries(input, 1)
  const selectionBounds = selected
    ? unionCanvasRectList(selected.map((entry) => entry.bounds))
    : null

  if (!selected || !selectionBounds) {
    return input.items
  }

  const pivot = getCanvasSelectionLayoutPivot(selectionBounds, axis)
  const selectedById = new Map(selected.map((entry) => [entry.id, entry]))

  return input.items.map((item, index) => {
    const id = input.getItemId(item, index)
    const entry = selectedById.get(id)

    if (!entry) {
      return item
    }

    const reflectedBounds = reflectCanvasSelectionLayoutBounds(
      entry.bounds,
      axis,
      pivot,
    )

    return flipItem
      ? flipItem({
          axis,
          bounds: entry.bounds,
          id: entry.id,
          index: entry.index,
          item: entry.item,
          pivot,
          reflectedBounds,
          selectionBounds,
        })
      : updateItemBounds(item, reflectedBounds, index)
  })
}

export function canTidyCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>(input: CanvasSelectionLayoutInput<TItem, TItemId>) {
  return getSelectedCanvasSelectionLayoutEntries(input, 3) !== null
}

export function tidyCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  gap = 24,
  updateItemBounds,
  ...input
}: CanvasSelectionTidyInput<TItem, TItemId>): TItem[] {
  const selected = getSelectedCanvasSelectionLayoutEntries(input, 3)
  const selectionBounds = selected
    ? unionCanvasRectList(selected.map((entry) => entry.bounds))
    : null

  if (!selected || !selectionBounds) {
    return input.items
  }

  const columnCount = Math.ceil(Math.sqrt(selected.length))
  const cellWidth = Math.max(...selected.map((entry) => entry.bounds.w)) + gap
  const cellHeight = Math.max(...selected.map((entry) => entry.bounds.h)) + gap
  const tidied = new Map<TItemId, TItem>()

  const sorted = [...selected]
    .sort((left, right) =>
      left.bounds.y === right.bounds.y
        ? left.bounds.x - right.bounds.x
        : left.bounds.y - right.bounds.y)

  sorted
    .forEach((entry, order) => {
      const column = order % columnCount
      const row = Math.floor(order / columnCount)

      tidied.set(entry.id, updateItemBounds(entry.item, {
        ...entry.bounds,
        x: selectionBounds.x + column * cellWidth,
        y: selectionBounds.y + row * cellHeight,
      }, entry.index))
    })

  return input.items.map((item, index) =>
    tidied.get(input.getItemId(item, index)) ?? item)
}

function getSelectedCanvasSelectionLayoutEntries<
  TItem,
  TItemId extends string = string,
>(
  {
    getItemBounds,
    getItemId,
    isItemSelectable = () => true,
    items,
    selection,
  }: CanvasSelectionLayoutInput<TItem, TItemId>,
  minCount: number,
): CanvasSelectionLayoutEntry<TItem, TItemId>[] | null {
  if (selection.length < minCount) {
    return null
  }

  const selectedIds = new Set<TItemId>(selection)
  const entries: CanvasSelectionLayoutEntry<TItem, TItemId>[] = []

  items.forEach((item, index) => {
    const id = getItemId(item, index)

    if (selectedIds.has(id) && isItemSelectable(item, index)) {
      entries.push({
        bounds: getItemBounds(item, index),
        id,
        index,
        item,
      })
    }
  })

  return entries.length === selection.length ? entries : null
}

function getCanvasSelectionLayoutPivot(
  bounds: Bounds,
  axis: CanvasSelectionLayoutAxis,
) {
  return axis === 'horizontal'
    ? bounds.x + bounds.w / 2
    : bounds.y + bounds.h / 2
}

function reflectCanvasSelectionLayoutBounds(
  bounds: Bounds,
  axis: CanvasSelectionLayoutAxis,
  pivot: number,
): Bounds {
  return axis === 'horizontal'
    ? { ...bounds, x: 2 * pivot - (bounds.x + bounds.w) }
    : { ...bounds, y: 2 * pivot - (bounds.y + bounds.h) }
}

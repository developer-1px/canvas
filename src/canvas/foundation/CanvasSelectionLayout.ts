import type { Bounds } from '../core'
import { unionCanvasRectList } from './CanvasHeadlessGeometry'
import type {
  CanvasAlignMode,
  CanvasDistributeMode,
  CanvasReorderMode,
} from './CanvasCommandTypes'

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

export type CanvasSelectionAlignInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  frame?: Bounds
  mode: CanvasAlignMode
}

export type CanvasSelectionDistributeInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionLayoutChangeInput<TItem, TItemId> & {
  mode: CanvasDistributeMode
}

export type CanvasSelectionReorderInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: TItem[]
  mode: CanvasReorderMode
  selection: readonly TItemId[]
}

export type CanvasSelectionMoveToIndexInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
  toIndex: number
}

export type CanvasSelectionMoveToIndexResult<TItem> = {
  changed: boolean
  items: TItem[]
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

export function canAlignCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  frame,
  ...input
}: CanvasSelectionLayoutInput<TItem, TItemId> & { frame?: Bounds }) {
  const minimumSelectionCount = frame ? 1 : 2

  return getSelectedCanvasSelectionLayoutEntries(
    input,
    minimumSelectionCount,
  ) !== null
}

export function alignCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  frame,
  mode,
  updateItemBounds,
  ...input
}: CanvasSelectionAlignInput<TItem, TItemId>): TItem[] {
  const selected = getSelectedCanvasSelectionLayoutEntries(
    input,
    frame ? 1 : 2,
  )
  const alignmentFrame = frame ??
    (selected ? unionCanvasRectList(selected.map((entry) => entry.bounds)) : null)

  if (!selected || !alignmentFrame) {
    return input.items
  }

  const aligned = new Map<TItemId, TItem>()

  selected.forEach((entry) => {
    aligned.set(entry.id, updateItemBounds(
      entry.item,
      getCanvasSelectionAlignedBounds(entry.bounds, alignmentFrame, mode),
      entry.index,
    ))
  })

  return input.items.map((item, index) =>
    aligned.get(input.getItemId(item, index)) ?? item)
}

export function canDistributeCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>(input: CanvasSelectionLayoutInput<TItem, TItemId>) {
  return getSelectedCanvasSelectionLayoutEntries(input, 3) !== null
}

export function distributeCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  mode,
  updateItemBounds,
  ...input
}: CanvasSelectionDistributeInput<TItem, TItemId>): TItem[] {
  const selected = getSelectedCanvasSelectionLayoutEntries(input, 3)

  if (!selected) {
    return input.items
  }

  const horizontal = mode === 'distributeHorizontal'
  const sorted = [...selected].sort((left, right) =>
    horizontal
      ? left.bounds.x - right.bounds.x
      : left.bounds.y - right.bounds.y)
  const first = sorted[0]
  const last = sorted.at(-1)

  if (!first || !last) {
    return input.items
  }

  const start = horizontal ? first.bounds.x : first.bounds.y
  const end = horizontal
    ? last.bounds.x + last.bounds.w
    : last.bounds.y + last.bounds.h
  const totalSize = sorted.reduce(
    (sum, entry) => sum + (horizontal ? entry.bounds.w : entry.bounds.h),
    0,
  )
  const gap = (end - start - totalSize) / (sorted.length - 1)
  let cursor = start
  const distributed = new Map<TItemId, TItem>()

  sorted.forEach((entry) => {
    const nextBounds = horizontal
      ? { ...entry.bounds, x: cursor }
      : { ...entry.bounds, y: cursor }

    distributed.set(
      entry.id,
      updateItemBounds(entry.item, nextBounds, entry.index),
    )
    cursor += (horizontal ? entry.bounds.w : entry.bounds.h) + gap
  })

  return input.items.map((item, index) =>
    distributed.get(input.getItemId(item, index)) ?? item)
}

export function canReorderCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  mode,
  selection,
}: Omit<CanvasSelectionReorderInput<TItem, TItemId>, 'items'> & {
  items: readonly TItem[]
}) {
  const next = reorderCanvasSelectionItems({
    getItemId,
    isItemSelectable,
    items: [...items],
    mode,
    selection,
  })

  return !areCanvasSelectionItemOrdersEqual(items, next, getItemId)
}

export function reorderCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  mode,
  selection,
}: CanvasSelectionReorderInput<TItem, TItemId>): TItem[] {
  const selected = getSelectedCanvasSelectionOrderIds({
    getItemId,
    isItemSelectable,
    items,
    selection,
  })

  if (selected.size === 0) {
    return items
  }

  if (mode === 'bringToFront') {
    return [
      ...items.filter((item, index) => !selected.has(getItemId(item, index))),
      ...items.filter((item, index) => selected.has(getItemId(item, index))),
    ]
  }

  if (mode === 'sendToBack') {
    return [
      ...items.filter((item, index) => selected.has(getItemId(item, index))),
      ...items.filter((item, index) => !selected.has(getItemId(item, index))),
    ]
  }

  const next = [...items]

  if (mode === 'bringForward') {
    for (let index = next.length - 2; index >= 0; index -= 1) {
      const currentId = getItemId(next[index], index)
      const nextId = getItemId(next[index + 1], index + 1)

      if (selected.has(currentId) && !selected.has(nextId)) {
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      }
    }
  } else {
    for (let index = 1; index < next.length; index += 1) {
      const currentId = getItemId(next[index], index)
      const previousId = getItemId(next[index - 1], index - 1)

      if (selected.has(currentId) && !selected.has(previousId)) {
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      }
    }
  }

  return next
}

export function moveCanvasSelectionItemsToIndex<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  selection,
  toIndex,
}: CanvasSelectionMoveToIndexInput<TItem, TItemId>):
  CanvasSelectionMoveToIndexResult<TItem> {
  const selected = getSelectedCanvasSelectionOrderIds({
    getItemId,
    isItemSelectable,
    items,
    selection,
  })

  if (selected.size === 0) {
    return { changed: false, items: [...items] }
  }

  const boundedToIndex = clampCanvasSelectionItemIndex(toIndex, items.length)
  const selectedBeforeDropIndex = items
    .slice(0, boundedToIndex)
    .filter((item, index) => selected.has(getItemId(item, index)))
    .length
  const block = items.filter((item, index) => selected.has(getItemId(item, index)))
  const remaining = items.filter((item, index) => !selected.has(getItemId(item, index)))
  const insertionIndex = clampCanvasSelectionItemIndex(
    boundedToIndex - selectedBeforeDropIndex,
    remaining.length,
  )
  const next = [
    ...remaining.slice(0, insertionIndex),
    ...block,
    ...remaining.slice(insertionIndex),
  ]

  return {
    changed: !areCanvasSelectionItemOrdersEqual(items, next, getItemId),
    items: next,
  }
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

function getSelectedCanvasSelectionOrderIds<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable,
  items,
  selection,
}: {
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
}) {
  const selectionIds = new Set(selection)
  const selected = new Set<TItemId>()

  items.forEach((item, index) => {
    const id = getItemId(item, index)

    if (selectionIds.has(id) && isItemSelectable(item, index)) {
      selected.add(id)
    }
  })

  return selected
}

function areCanvasSelectionItemOrdersEqual<
  TItem,
  TItemId extends string = string,
>(
  left: readonly TItem[],
  right: readonly TItem[],
  getItemId: (item: TItem, index: number) => TItemId,
) {
  return left.length === right.length &&
    left.every((item, index) => {
      const rightItem = right[index]

      return rightItem !== undefined &&
        getItemId(item, index) === getItemId(rightItem, index)
    })
}

function clampCanvasSelectionItemIndex(index: number, length: number) {
  return Math.max(0, Math.min(length, index))
}

function getCanvasSelectionAlignedBounds(
  bounds: Bounds,
  frame: Bounds,
  mode: CanvasAlignMode,
): Bounds {
  if (mode === 'alignLeft') {
    return { ...bounds, x: frame.x }
  }

  if (mode === 'alignCenter') {
    return { ...bounds, x: frame.x + frame.w / 2 - bounds.w / 2 }
  }

  if (mode === 'alignRight') {
    return { ...bounds, x: frame.x + frame.w - bounds.w }
  }

  if (mode === 'alignTop') {
    return { ...bounds, y: frame.y }
  }

  if (mode === 'alignMiddle') {
    return { ...bounds, y: frame.y + frame.h / 2 - bounds.h / 2 }
  }

  return { ...bounds, y: frame.y + frame.h - bounds.h }
}

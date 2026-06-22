import type { CanvasReorderMode } from './CanvasCommandTypes'
import {
  areCanvasSelectionItemOrdersEqual,
  clampCanvasSelectionItemIndex,
  getSelectedCanvasSelectionOrderIds,
} from './CanvasSelectionOrderHelpers'

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

export type CanvasItemTargetPlacement = 'after' | 'before'

export type CanvasItemTargetPlacementMoveInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemId: (item: TItem, index: number) => TItemId
  itemId: TItemId
  items: readonly TItem[]
  placement: CanvasItemTargetPlacement
  targetItemId: TItemId
}

export type CanvasItemTargetPlacementMoveResult<TItem> = {
  fromIndex: number
  items: TItem[]
  toIndex: number
}

export type CanvasItemTargetPlacementInsertInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemId: (item: TItem, index: number) => TItemId
  item: TItem
  items: readonly TItem[]
  placement: CanvasItemTargetPlacement
  targetItemId: TItemId
}

export type CanvasItemTargetPlacementInsertResult<TItem> = {
  index: number
  items: TItem[]
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

export function moveCanvasItemToTargetPlacement<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  itemId,
  items,
  placement,
  targetItemId,
}: CanvasItemTargetPlacementMoveInput<TItem, TItemId>):
  CanvasItemTargetPlacementMoveResult<TItem> | null {
  const fromIndex = items.findIndex((item, index) =>
    getItemId(item, index) === itemId)
  const targetIndex = items.findIndex((item, index) =>
    getItemId(item, index) === targetItemId)

  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) {
    return null
  }

  const result = moveCanvasSelectionItemsToIndex({
    getItemId,
    items,
    selection: [itemId],
    toIndex: targetIndex + (placement === 'after' ? 1 : 0),
  })

  if (!result.changed) {
    return null
  }

  const toIndex = result.items.findIndex((item, index) =>
    getItemId(item, index) === itemId)

  return toIndex < 0
    ? null
    : {
        fromIndex,
        items: result.items,
        toIndex,
      }
}

export function insertCanvasItemAtTargetPlacement<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  item,
  items,
  placement,
  targetItemId,
}: CanvasItemTargetPlacementInsertInput<TItem, TItemId>):
  CanvasItemTargetPlacementInsertResult<TItem> | null {
  const targetIndex = items.findIndex((candidate, index) =>
    getItemId(candidate, index) === targetItemId)

  if (targetIndex < 0) {
    return null
  }

  const index = targetIndex + (placement === 'after' ? 1 : 0)

  return {
    index,
    items: [
      ...items.slice(0, index),
      item,
      ...items.slice(index),
    ],
  }
}

import { unionCanvasRectList } from './CanvasHeadlessGeometry'
import type { Bounds } from '../core'
import { alignCanvasRectList, distributeCanvasRectList } from './CanvasRectLayout'
import type {
  CanvasSelectionAlignInput,
  CanvasSelectionDistributeInput,
  CanvasSelectionFlipInput,
  CanvasSelectionLayoutAxis,
  CanvasSelectionTidyInput,
} from './CanvasSelectionLayoutContracts'
import {
  getSelectedCanvasSelectionLayoutEntries,
} from './CanvasSelectionLayoutQueries'

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

  const rectPlans = alignCanvasRectList({
    entries: selected.map((entry) => ({
      bounds: entry.bounds,
      id: entry.id,
    })),
    frame: alignmentFrame,
    mode,
  })
  const rectPlanById = new Map(
    rectPlans.map((plan) => [plan.id, plan.bounds]),
  )

  selected.forEach((entry) => {
    const bounds = rectPlanById.get(entry.id)

    if (!bounds) {
      return
    }

    aligned.set(entry.id, updateItemBounds(
      entry.item,
      bounds,
      entry.index,
    ))
  })

  return input.items.map((item, index) =>
    aligned.get(input.getItemId(item, index)) ?? item)
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

  const rectPlans = distributeCanvasRectList({
    entries: selected.map((entry) => ({
      bounds: entry.bounds,
      id: entry.id,
    })),
    mode,
  })
  const rectPlanById = new Map(
    rectPlans.map((plan) => [plan.id, plan.bounds]),
  )
  const distributed = new Map<TItemId, TItem>()

  selected.forEach((entry) => {
    const bounds = rectPlanById.get(entry.id)

    if (!bounds) {
      return
    }

    distributed.set(
      entry.id,
      updateItemBounds(entry.item, bounds, entry.index),
    )
  })

  return input.items.map((item, index) =>
    distributed.get(input.getItemId(item, index)) ?? item)
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

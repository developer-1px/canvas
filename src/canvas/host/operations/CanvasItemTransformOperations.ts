import type { Bounds } from '../../core'
import type { CanvasItem } from '../model'
import { scaleItemBounds } from '../../core'
import { isCanvasItemAttachedTo } from '../attachment/CanvasItemAttachment'
import { isCanvasSectionComponentItem } from '../component/CanvasSectionComponent'
import {
  isCanvasArrowDrawingItem,
  isCanvasDrawingItem,
  scaleCanvasDrawingItem,
  translateCanvasArrowAttachedEndpoints,
  translateCanvasDrawingItem,
} from '../drawing/CanvasDrawingItemGeometry'
import {
  getItemBounds,
  flattenCanvasItems,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { mapCanvasItems } from './CanvasItemOperationTree'
import { isCanvasItemLocked } from './CanvasItemLockOperations'
import { canResizeCanvasItem } from './CanvasItemRotationOperations'

export function translateCanvasItems(
  items: CanvasItem[],
  ids: string[],
  dx: number,
  dy: number,
) {
  const selected = new Set(pruneNestedSelection(items, ids))
  const movableSelected = getMovableSelectedCanvasItemIds(items, selected)
  const movableWithSectionContents = getMovableCanvasItemIdsWithSectionContents({
    items,
    selected: movableSelected,
  })

  return mapCanvasItems(items, (item) =>
    translateCanvasItemForSelection({
      dx,
      dy,
      item,
      movableSelected: movableWithSectionContents,
    }),
  )
}

export function resizeCanvasItems(
  items: CanvasItem[],
  ids: string[],
  from: Bounds,
  to: Bounds,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  return mapCanvasItems(items, (item) =>
    selected.has(item.id) && !isCanvasItemLocked(item) && canResizeCanvasItem(item)
      ? scaleCanvasItem(item, from, to)
      : item,
  )
}

function translateCanvasItem(item: CanvasItem, dx: number, dy: number): CanvasItem {
  if (isCanvasGroupItem(item)) {
    return syncGroupBounds({
      ...item,
      x: item.x + dx,
      y: item.y + dy,
      children: item.children.map((child) => translateCanvasItem(child, dx, dy)),
    })
  }

  if (isCanvasDrawingItem(item)) {
    return translateCanvasDrawingItem({
      dx,
      dy,
      item,
    })
  }

  return {
    ...item,
    x: item.x + dx,
    y: item.y + dy,
  }
}

function translateCanvasItemForSelection({
  dx,
  dy,
  item,
  movableSelected,
}: {
  dx: number
  dy: number
  item: CanvasItem
  movableSelected: ReadonlySet<string>
}) {
  if (isCanvasItemLocked(item)) {
    return item
  }

  if (
    movableSelected.has(item.id) ||
    isCanvasItemAttachedTo(item, movableSelected)
  ) {
    return translateCanvasItem(item, dx, dy)
  }

  if (isCanvasArrowDrawingItem(item)) {
    return translateCanvasArrowAttachedEndpoints({
      attachedIds: movableSelected,
      dx,
      dy,
      item,
    })
  }

  return item
}

function getMovableSelectedCanvasItemIds(
  items: CanvasItem[],
  selected: ReadonlySet<string>,
) {
  return new Set(
    flattenCanvasItems(items)
      .filter((entry) =>
        selected.has(entry.item.id) && !isCanvasItemLocked(entry.item),
      )
      .map((entry) => entry.item.id),
  )
}

function getMovableCanvasItemIdsWithSectionContents({
  items,
  selected,
}: {
  items: CanvasItem[]
  selected: ReadonlySet<string>
}) {
  const movableIds = new Set(selected)
  const entries = flattenCanvasItems(items)
  const sectionBounds = entries
    .filter((entry) =>
      selected.has(entry.item.id) &&
      isCanvasSectionComponentItem(entry.item) &&
      !isCanvasItemLocked(entry.item),
    )
    .map((entry) => getItemBounds(entry.item))

  if (sectionBounds.length === 0) {
    return movableIds
  }

  for (const entry of entries) {
    if (
      movableIds.has(entry.item.id) ||
      isCanvasItemLocked(entry.item) ||
      !isContainedByAnyCanvasSection(entry.item, sectionBounds)
    ) {
      continue
    }

    movableIds.add(entry.item.id)
  }

  return movableIds
}

function isContainedByAnyCanvasSection(
  item: CanvasItem,
  sectionBounds: readonly Bounds[],
) {
  const bounds = getItemBounds(item)

  return sectionBounds.some((section) =>
    isCanvasBoundsInsideBounds(bounds, section),
  )
}

function isCanvasBoundsInsideBounds(bounds: Bounds, container: Bounds) {
  return (
    bounds.x >= container.x &&
    bounds.y >= container.y &&
    bounds.x + bounds.w <= container.x + container.w &&
    bounds.y + bounds.h <= container.y + container.h
  )
}

function scaleCanvasItem(item: CanvasItem, from: Bounds, to: Bounds): CanvasItem {
  if (isCanvasGroupItem(item)) {
    return syncGroupBounds({
      ...item,
      ...scaleItemBounds(getItemBounds(item), from, to),
      children: item.children.map((child) => scaleCanvasItem(child, from, to)),
    })
  }

  if (isCanvasDrawingItem(item)) {
    return scaleCanvasDrawingItem({
      from,
      item,
      to,
    })
  }

  return {
    ...item,
    ...scaleItemBounds(getItemBounds(item), from, to),
  }
}

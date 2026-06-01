import type { CanvasItem } from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { pruneNestedSelection, syncGroupBounds } from '../tree/CanvasTree'

export type CanvasZOrderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export function reorderCanvasItems(
  items: CanvasItem[],
  ids: string[],
  mode: CanvasZOrderMode,
) {
  const selected = new Set(pruneNestedSelection(items, ids))

  if (selected.size === 0) {
    return items
  }

  return reorderCanvasItemTree(items, selected, mode)
}

export function canReorderCanvasItems(
  items: CanvasItem[],
  ids: string[],
  mode: CanvasZOrderMode,
) {
  return !areCanvasItemOrdersEqual(
    items,
    reorderCanvasItems(items, ids, mode),
  )
}

function reorderCanvasItemTree(
  items: CanvasItem[],
  selected: Set<string>,
  mode: CanvasZOrderMode,
): CanvasItem[] {
  return reorderCanvasSiblings(items, selected, mode).map((item) => {
    if (!isCanvasGroupItem(item)) {
      return item
    }

    return syncGroupBounds({
      ...item,
      children: reorderCanvasItemTree(item.children, selected, mode),
    })
  })
}

function reorderCanvasSiblings(
  items: CanvasItem[],
  selected: Set<string>,
  mode: CanvasZOrderMode,
) {
  if (!items.some((item) => selected.has(item.id))) {
    return items
  }

  if (!items.some((item) => selected.has(item.id) && isCanvasSectionLayer(item))) {
    return mergeCanvasSectionLayers(
      items,
      reorderCanvasSiblingList(
        items.filter((item) => !isCanvasSectionLayer(item)),
        selected,
        mode,
      ),
    )
  }

  return reorderCanvasSiblingList(items, selected, mode)
}

function reorderCanvasSiblingList(
  items: CanvasItem[],
  selected: Set<string>,
  mode: CanvasZOrderMode,
) {
  if (mode === 'bringToFront') {
    return [
      ...items.filter((item) => !selected.has(item.id)),
      ...items.filter((item) => selected.has(item.id)),
    ]
  }

  if (mode === 'sendToBack') {
    return [
      ...items.filter((item) => selected.has(item.id)),
      ...items.filter((item) => !selected.has(item.id)),
    ]
  }

  const next = [...items]

  if (mode === 'bringForward') {
    for (let index = next.length - 2; index >= 0; index -= 1) {
      if (selected.has(next[index].id) && !selected.has(next[index + 1].id)) {
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      }
    }
  } else {
    for (let index = 1; index < next.length; index += 1) {
      if (selected.has(next[index].id) && !selected.has(next[index - 1].id)) {
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      }
    }
  }

  return next
}

function mergeCanvasSectionLayers(
  items: CanvasItem[],
  reorderedItems: CanvasItem[],
) {
  let reorderedIndex = 0

  return items.map((item) => {
    if (isCanvasSectionLayer(item)) {
      return item
    }

    const nextItem = reorderedItems[reorderedIndex]
    reorderedIndex += 1
    return nextItem ?? item
  })
}

function isCanvasSectionLayer(item: CanvasItem) {
  return item.type === 'component' && item.component === 'section'
}

function areCanvasItemOrdersEqual(left: CanvasItem[], right: CanvasItem[]) {
  const leftIds = getCanvasItemOrderIds(left)
  const rightIds = getCanvasItemOrderIds(right)

  return leftIds.length === rightIds.length &&
    leftIds.every((id, index) => rightIds[index] === id)
}

function getCanvasItemOrderIds(items: CanvasItem[]) {
  const ids: string[] = []

  function visit(nodes: CanvasItem[]) {
    nodes.forEach((item) => {
      ids.push(item.id)

      if (isCanvasGroupItem(item)) {
        visit(item.children)
      }
    })
  }

  visit(items)
  return ids
}

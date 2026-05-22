import type { JSONPatchOperation, Pointer } from 'zod-crud'
import type { Bounds } from '../../engine/primitives/CanvasPrimitives'
import type { CanvasItem } from '../model/CanvasModel'
import {
  removeCanvasItems,
  resizeCanvasItems,
} from '../operations/CanvasOperations'
import {
  findCanvasItemEntry,
  flattenCanvasItems,
  type CanvasItemEntry,
} from '../tree/CanvasTree'
import { isAncestorPath } from '../tree/CanvasTreePath'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

export function createRemoveCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
): JSONPatchOperation[] {
  const nextItems = removeCanvasItems(items, selection)
  const beforeEntries = flattenCanvasItems(items)
  const afterEntries = flattenCanvasItems(nextItems)
  const afterIds = new Set(afterEntries.map((entry) => entry.item.id))
  const removedEntries = beforeEntries.filter(
    (entry) => !afterIds.has(entry.item.id),
  )

  if (removedEntries.length === 0) {
    return []
  }

  const removeOps = getTopmostEntries(removedEntries)
    .sort(compareEntriesByDescendingPath)
    .map((entry): JSONPatchOperation => ({
      op: 'remove',
      path: canvasItemPathToPointer(entry.path),
    }))
  const replaceGroupOps = getChangedTopmostGroups(
    beforeEntries,
    afterEntries,
  ).map((entry): JSONPatchOperation => ({
    op: 'replace',
    path: canvasItemPathToPointer(entry.path),
    value: entry.item,
  }))

  return [...removeOps, ...replaceGroupOps]
}

export function createAddCanvasItemsPatch(
  items: CanvasItem[],
): JSONPatchOperation[] {
  return items.map((item) => ({
    op: 'add',
    path: '/-',
    value: item,
  }))
}

export function createResizeCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
  from: Bounds,
  to: Bounds,
): JSONPatchOperation[] {
  return createReplaceChangedCanvasItemsPatch(
    items,
    resizeCanvasItems(items, selection, from, to),
  )
}

export function createSetCanvasItemTextPatch(
  items: CanvasItem[],
  id: string,
  text: string,
): JSONPatchOperation[] {
  const entry = findCanvasItemEntry(items, id)

  if (
    !entry ||
    (entry.item.type !== 'rect' && entry.item.type !== 'text') ||
    entry.item.text === text
  ) {
    return []
  }

  return [{
    op: entry.item.type === 'rect' && entry.item.text === undefined
      ? 'add'
      : 'replace',
    path: `${canvasItemPathToPointer(entry.path)}/text` as Pointer,
    value: text,
  }]
}

export function createReplaceChangedCanvasItemsPatch(
  beforeItems: CanvasItem[],
  afterItems: CanvasItem[],
): JSONPatchOperation[] {
  const beforeEntries = flattenCanvasItems(beforeItems)
  const afterEntries = flattenCanvasItems(afterItems)
  const beforeById = new Map(
    beforeEntries.map((entry) => [entry.item.id, entry]),
  )
  const changedEntries = afterEntries.filter((entry) => {
    const before = beforeById.get(entry.item.id)

    return before ? !canvasItemsEqual(before.item, entry.item) : false
  })

  return getTopmostEntries(changedEntries).map((entry) => ({
    op: 'replace',
    path: canvasItemPathToPointer(entry.path),
    value: entry.item,
  }))
}

function getTopmostEntries(entries: CanvasItemEntry[]) {
  return entries.filter(
    (entry) =>
      !entries.some((candidate) => isAncestorPath(candidate.path, entry.path)),
  )
}

function getChangedTopmostGroups(
  beforeEntries: CanvasItemEntry[],
  afterEntries: CanvasItemEntry[],
) {
  const beforeById = new Map(
    beforeEntries.map((entry) => [entry.item.id, entry]),
  )
  const changedGroups = afterEntries.filter((entry) => {
    if (entry.item.type !== 'group') {
      return false
    }

    const before = beforeById.get(entry.item.id)
    return before ? !canvasItemsEqual(before.item, entry.item) : false
  })

  return getTopmostEntries(changedGroups)
}

function compareEntriesByDescendingPath(
  a: CanvasItemEntry,
  b: CanvasItemEntry,
) {
  const length = Math.max(a.path.length, b.path.length)

  for (let index = 0; index < length; index += 1) {
    const left = a.path[index] ?? -1
    const right = b.path[index] ?? -1

    if (left !== right) {
      return right - left
    }
  }

  return b.path.length - a.path.length
}

function canvasItemsEqual(a: CanvasItem, b: CanvasItem) {
  return JSON.stringify(a) === JSON.stringify(b)
}

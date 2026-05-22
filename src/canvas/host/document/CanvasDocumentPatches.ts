import type { JSONPatchOperation } from 'zod-crud'
import type { CanvasItem } from '../model/CanvasModel'
import { removeCanvasItems } from '../operations/CanvasOperations'
import {
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

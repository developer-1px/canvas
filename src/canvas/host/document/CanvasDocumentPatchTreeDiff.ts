import type { CanvasItem } from '../model'
import {
  flattenCanvasItems,
  isCanvasGroupItem,
  type CanvasItemEntry,
} from '../tree/CanvasTree'
import { isAncestorPath } from '../tree/CanvasTreePath'

export type CanvasDocumentPatchEntry = CanvasItemEntry

export type CanvasDocumentPatchTreeDiff = {
  changedTopmostEntries: CanvasDocumentPatchEntry[]
  changedTopmostGroupEntries: CanvasDocumentPatchEntry[]
  removalEntries: CanvasDocumentPatchEntry[]
}

export function getCanvasDocumentPatchEntries(
  items: CanvasItem[],
): CanvasDocumentPatchEntry[] {
  return flattenCanvasItems(items)
}

export function createCanvasDocumentPatchTreeDiff({
  afterItems,
  beforeItems,
}: {
  afterItems: CanvasItem[]
  beforeItems: CanvasItem[]
}): CanvasDocumentPatchTreeDiff {
  const beforeEntries = getCanvasDocumentPatchEntries(beforeItems)
  const afterEntries = getCanvasDocumentPatchEntries(afterItems)
  const beforeById = new Map(
    beforeEntries.map((entry) => [entry.item.id, entry]),
  )
  const afterIds = new Set(afterEntries.map((entry) => entry.item.id))
  const removedEntries = beforeEntries.filter(
    (entry) => !afterIds.has(entry.item.id),
  )
  const changedEntries = afterEntries.filter((entry) => {
    const before = beforeById.get(entry.item.id)

    return before
      ? !areCanvasDocumentPatchItemsEqual(before.item, entry.item)
      : false
  })
  const changedGroupEntries = changedEntries.filter(
    (entry) => isCanvasGroupItem(entry.item),
  )

  return {
    changedTopmostEntries: getTopmostCanvasDocumentPatchEntries(changedEntries),
    changedTopmostGroupEntries:
      getTopmostCanvasDocumentPatchEntries(changedGroupEntries),
    removalEntries: getCanvasDocumentPatchRemovalEntries(removedEntries),
  }
}

export function getCanvasDocumentPatchRemovalEntries(
  entries: CanvasDocumentPatchEntry[],
) {
  return getTopmostCanvasDocumentPatchEntries(entries)
    .sort(compareCanvasDocumentPatchEntriesByDescendingPath)
}

export function areCanvasDocumentPatchItemsEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function getTopmostCanvasDocumentPatchEntries(
  entries: CanvasDocumentPatchEntry[],
) {
  return entries.filter(
    (entry) =>
      !entries.some((candidate) => isAncestorPath(candidate.path, entry.path)),
  )
}

function compareCanvasDocumentPatchEntriesByDescendingPath(
  a: CanvasDocumentPatchEntry,
  b: CanvasDocumentPatchEntry,
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

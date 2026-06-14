import type { JSONPatchOperation, JSONResult, SelectionSnap } from '@interactive-os/json-document'
import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import type { CanvasItemsDocument } from './CanvasDocument'
import {
  findCanvasItemEntry,
  flattenCanvasItems,
} from '../tree/CanvasTree'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

export function restoreCanvasDocumentSelection(
  document: CanvasItemsDocument,
  ids: CanvasSelectionIds,
  items: CanvasItem[] = document.value,
) {
  document.selection?.restore(createCanvasSelectionSnapshot(items, ids))
}

export function commitCanvasDocumentSelection(
  document: CanvasItemsDocument,
  ids: CanvasSelectionIds,
) {
  const before = getCanvasDocumentSelectionIds(document)
  const afterSnapshot = createCanvasSelectionSnapshot(document.value, ids)
  const after = getCanvasSelectionIdsFromSnapshot(document.value, afterSnapshot)

  if (canvasSelectionIdsEqual(before, after)) {
    return false
  }

  const result = document.commit(
    createCanvasSelectionMutationPatch(document.value),
    {
      label: 'canvas selection',
      origin: 'canvas',
      selection: afterSnapshot,
    },
  )

  assertJSONResult(result)
  return true
}

export function getCanvasDocumentSelectionIds(
  document: CanvasItemsDocument,
) {
  return getCanvasSelectionIdsFromSnapshot(
    document.value,
    document.selection?.snapshot() ?? createEmptyCanvasSelectionSnapshot(),
  )
}

export function createCanvasSelectionSnapshot(
  items: CanvasItem[],
  ids: CanvasSelectionIds,
): SelectionSnap {
  const pointers = ids.flatMap((id) => {
    const entry = findCanvasItemEntry(items, id)

    return entry ? [canvasItemPathToPointer(entry.path)] : []
  })

  if (pointers.length === 0) {
    return createEmptyCanvasSelectionSnapshot()
  }

  const primaryIndex = pointers.length - 1
  const primaryPointer = pointers[primaryIndex]

  return {
    selectedPointers: pointers,
    selectionRanges: pointers.map((pointer) => ({
      anchor: pointer,
      focus: pointer,
    })),
    primaryIndex,
    anchor: primaryPointer,
    focus: primaryPointer,
  }
}

function getCanvasSelectionIdsFromSnapshot(
  items: CanvasItem[],
  snapshot: SelectionSnap,
) {
  const entries = flattenCanvasItems(items)
  const byPointer = new Map(
    entries.map((entry) => [canvasItemPathToPointer(entry.path), entry.item.id]),
  )

  return snapshot.selectedPointers.flatMap((pointer) => {
    const id = byPointer.get(pointer)

    return id ? [id] : []
  })
}

function createEmptyCanvasSelectionSnapshot(): SelectionSnap {
  return {
    selectedPointers: [],
    selectionRanges: [],
    primaryIndex: -1,
    anchor: null,
    focus: null,
  }
}

function createCanvasSelectionMutationPatch(
  items: CanvasItem[],
): JSONPatchOperation[] {
  const firstItem = items[0]

  return firstItem
    ? [{ op: 'test', path: '/0/id', value: firstItem.id }]
    : [{ op: 'test', path: '', value: [] }]
}

function canvasSelectionIdsEqual(
  left: CanvasSelectionIds,
  right: CanvasSelectionIds,
) {
  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index])
  )
}

function assertJSONResult(result: JSONResult): asserts result is { ok: true } {
  if (!result.ok) {
    throw new Error(result.reason ?? result.code)
  }
}

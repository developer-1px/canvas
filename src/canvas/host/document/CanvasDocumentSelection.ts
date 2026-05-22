import type { SelectionSnap } from 'zod-crud'
import type { CanvasItem } from '../model/CanvasModel'
import type { CanvasItemsDocument } from './CanvasDocument'
import {
  findCanvasItemEntry,
  flattenCanvasItems,
} from '../tree/CanvasTree'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

export type CanvasSelectionIds = string[]

export function restoreCanvasDocumentSelection(
  document: CanvasItemsDocument,
  ids: CanvasSelectionIds,
  items: CanvasItem[] = document.value,
) {
  document.selection?.restore(createCanvasSelectionSnapshot(items, ids))
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

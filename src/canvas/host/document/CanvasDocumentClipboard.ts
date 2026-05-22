import type { CanvasItem } from '../../entities'
import {
  findCanvasItemEntry,
  pruneNestedSelection,
  syncCanvasItems,
} from '../tree/CanvasTree'
import { validateCanvasItems } from './CanvasItemSchema'
import type { CanvasItemsDocument } from './CanvasDocument'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

export function copyCanvasDocumentSelectionToClipboard(
  document: CanvasItemsDocument,
  selection: string[],
  items: CanvasItem[] = document.value,
) {
  const pointers = pruneNestedSelection(items, selection).flatMap((id) => {
    const entry = findCanvasItemEntry(items, id)

    return entry ? [canvasItemPathToPointer(entry.path)] : []
  })

  if (pointers.length === 0) {
    return false
  }

  return document.clipboard.copy(pointers).ok
}

export function readCanvasDocumentClipboardItems(
  document: CanvasItemsDocument,
) {
  const read = document.clipboard.read()

  if (!read.ok) {
    return []
  }

  const payload = Array.isArray(read.payload) ? read.payload : [read.payload]
  return validateCanvasItems(payload as CanvasItem[])
}

export function writeCanvasDocumentClipboardItems(
  document: CanvasItemsDocument,
  items: CanvasItem[],
) {
  const result = document.clipboard.write(syncCanvasItems(items))

  return result.ok
}

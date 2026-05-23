import type { CanvasItem } from '../model'
import {
  findCanvasItemEntry,
  pruneNestedSelection,
} from '../tree/CanvasTree'
import {
  validateCanvasItems,
  type CanvasItemValidationOptions,
} from './CanvasItemSchema'
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
  validation?: CanvasItemValidationOptions,
) {
  const read = document.clipboard.read()

  if (!read.ok) {
    return []
  }

  const payload = Array.isArray(read.payload) ? read.payload : [read.payload]

  try {
    return validateCanvasItems(payload as CanvasItem[], validation)
  } catch {
    return []
  }
}

export function writeCanvasDocumentClipboardItems(
  document: CanvasItemsDocument,
  items: CanvasItem[],
  validation?: CanvasItemValidationOptions,
) {
  let validItems: CanvasItem[]

  try {
    validItems = validateCanvasItems(items, validation)
  } catch {
    return false
  }

  const result = document.clipboard.write(validItems)

  return result.ok
}

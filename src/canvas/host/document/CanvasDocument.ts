import {
  createJSONDocument,
  type JSONDocument,
  type JSONPatchOperation,
  type JSONResult,
} from 'zod-crud'
import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import { CanvasItemsSchema, validateCanvasItems } from './CanvasItemSchema'
import { syncCanvasItems } from '../tree/CanvasTree'
import {
  createCanvasSelectionSnapshot,
  restoreCanvasDocumentSelection,
} from './CanvasDocumentSelection'

export {
  commitCanvasDocumentSelection,
  getCanvasDocumentSelectionIds,
  restoreCanvasDocumentSelection,
} from './CanvasDocumentSelection'
export {
  createReplaceCanvasDocumentTextPatch,
  findCanvasDocumentText,
  type CanvasTextSearchMatch,
  type CanvasTextSearchOptions,
} from './CanvasDocumentSearch'
export type { CanvasSelectionIds } from '../../core'

export const CANVAS_DOCUMENT_HISTORY_LIMIT = 100

export type CanvasItemsDocument = JSONDocument<CanvasItem[]>

export function replaceCanvasItems(
  _current: CanvasItem[],
  next: CanvasItem[],
) {
  return validateCanvasItems(next)
}

export function applyCanvasItemsPatch(
  current: CanvasItem[],
  patch: JSONPatchOperation[],
) {
  const document = createCanvasItemsDocument(current, { history: 0 })
  const result = document.patch(patch)

  assertJSONResult(result)

  return syncCanvasItems(document.value)
}

export function createCanvasItemsDocument(
  initialItems: CanvasItem[],
  options: { history?: number; selection?: CanvasSelectionIds } = {},
): CanvasItemsDocument {
  const document = createJSONDocument(
    CanvasItemsSchema as never,
    syncCanvasItems(initialItems) as never,
    {
      history: options.history ?? CANVAS_DOCUMENT_HISTORY_LIMIT,
      selection: { mode: 'multiple' },
      strict: false,
    },
  ) as CanvasItemsDocument

  if (options.selection) {
    restoreCanvasDocumentSelection(document, options.selection)
  }

  return document
}

export function commitCanvasItemsPatch({
  document,
  patch,
  selection,
}: {
  document: CanvasItemsDocument
  patch: JSONPatchOperation[]
  selection?: {
    after: CanvasSelectionIds
    before: CanvasSelectionIds
  }
}) {
  if (patch.length === 0) {
    return false
  }

  const next = applyCanvasItemsPatch(document.value, patch)

  if (canvasItemsEqual(document.value, next)) {
    return false
  }

  if (selection) {
    restoreCanvasDocumentSelection(document, selection.before, document.value)
  }

  const result = document.commit(
    patch,
    selection
      ? {
          label: 'canvas items',
          origin: 'canvas',
          selection: createCanvasSelectionSnapshot(next, selection.after),
        }
      : {
          label: 'canvas items',
          origin: 'canvas',
        },
  )

  assertJSONResult(result)
  return true
}

export function canvasItemsEqual(a: CanvasItem[], b: CanvasItem[]) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function assertJSONResult(result: JSONResult): asserts result is { ok: true } {
  if (!result.ok) {
    throw new Error(result.reason ?? result.code)
  }
}

import {
  createJSONDocument,
  type JSONDocument,
  type JSONPatchOperation,
  type JSONResult,
} from 'zod-crud'
import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import {
  CanvasItemsSchema,
  validateCanvasItems,
  type CanvasItemValidationOptions,
} from './CanvasItemSchema'
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
  validation?: CanvasItemValidationOptions,
) {
  return validateCanvasItems(next, validation)
}

export function applyCanvasItemsPatch(
  current: CanvasItem[],
  patch: JSONPatchOperation[],
  validation?: CanvasItemValidationOptions,
) {
  return previewCanvasItemsPatch(current, patch, validation).items
}

function previewCanvasItemsPatch(
  current: CanvasItem[],
  patch: JSONPatchOperation[],
  validation?: CanvasItemValidationOptions,
) {
  const document = createCanvasItemsDocument(current, {
    history: 0,
    ...validation,
  })
  const result = document.patch(patch)

  assertJSONResult(result)

  return {
    items: validateCanvasItems(document.value, validation),
    rawItems: document.value,
  }
}

export function createCanvasItemsDocument(
  initialItems: CanvasItem[],
  options: {
    history?: number
    selection?: CanvasSelectionIds
  } & CanvasItemValidationOptions = {},
): CanvasItemsDocument {
  const items = validateCanvasItems(syncCanvasItems(initialItems), options)
  const document = createJSONDocument(
    CanvasItemsSchema as never,
    items as never,
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
  validation,
}: {
  document: CanvasItemsDocument
  patch: JSONPatchOperation[]
  validation?: CanvasItemValidationOptions
  selection?: {
    after: CanvasSelectionIds
    before: CanvasSelectionIds
  }
}) {
  if (patch.length === 0) {
    return false
  }

  const next = previewCanvasItemsPatch(document.value, patch, validation)

  if (canvasItemsEqual(document.value, next.items)) {
    return false
  }

  const committedPatch = canvasItemsEqual(next.rawItems, next.items)
    ? patch
    : [{
        op: 'replace',
        path: '',
        value: next.items,
      } satisfies JSONPatchOperation]

  if (selection) {
    restoreCanvasDocumentSelection(document, selection.before, document.value)
  }

  const result = document.commit(
    committedPatch,
    selection
      ? {
          label: 'canvas items',
          origin: 'canvas',
          selection: createCanvasSelectionSnapshot(next.items, selection.after),
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

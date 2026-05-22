import {
  createJSONDocument,
  type JSONDocument,
  type JSONPatchOperation,
  type JSONResult,
} from 'zod-crud'
import type { CanvasItem } from './CanvasModel'
import { CanvasItemsSchema, validateCanvasItems } from './CanvasItemSchema'
import { syncCanvasItems } from './CanvasTree'
import {
  createCanvasSelectionSnapshot,
  restoreCanvasDocumentSelection,
  type CanvasSelectionIds,
} from './CanvasDocumentSelection'

export { getCanvasDocumentSelectionIds, restoreCanvasDocumentSelection } from './CanvasDocumentSelection'
export type { CanvasSelectionIds } from './CanvasDocumentSelection'

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
  options: { history?: number } = {},
): CanvasItemsDocument {
  return createJSONDocument(
    CanvasItemsSchema as never,
    syncCanvasItems(initialItems) as never,
    {
      history: options.history ?? CANVAS_DOCUMENT_HISTORY_LIMIT,
      selection: { mode: 'multiple' },
      strict: false,
    },
  ) as CanvasItemsDocument
}

export function commitCanvasItemsDocument({
  document,
  nextItems,
  selection,
}: {
  document: CanvasItemsDocument
  nextItems: CanvasItem[]
  selection?: {
    after: CanvasSelectionIds
    before: CanvasSelectionIds
  }
}) {
  const next = validateCanvasItems(nextItems)

  if (canvasItemsEqual(document.value, next)) {
    return false
  }

  if (selection) {
    restoreCanvasDocumentSelection(document, selection.before, document.value)
  }

  const result = document.commit(
    [{ op: 'replace', path: '', value: next }],
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

export function loadCanvasItemsDocument(
  document: CanvasItemsDocument,
  items: CanvasItem[],
) {
  const result = document.load(validateCanvasItems(items), {
    preserveHistory: true,
  })

  assertJSONResult(result)
}

export function canvasItemsEqual(a: CanvasItem[], b: CanvasItem[]) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function assertJSONResult(result: JSONResult): asserts result is { ok: true } {
  if (!result.ok) {
    throw new Error(result.reason ?? result.code)
  }
}

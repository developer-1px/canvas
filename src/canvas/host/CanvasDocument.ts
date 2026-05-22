import {
  createJSONDocument,
  type JSONDocument,
  type JSONPatchOperation,
  type JSONResult,
  type Pointer,
  type SelectionSnap,
} from 'zod-crud'
import type { CanvasItem } from './CanvasModel'
import { CanvasItemsSchema, validateCanvasItems } from './CanvasItemSchema'
import {
  findCanvasItemEntry,
  flattenCanvasItems,
  syncCanvasItems,
} from './CanvasTree'

export const CANVAS_DOCUMENT_HISTORY_LIMIT = 100

export type CanvasItemsDocument = JSONDocument<CanvasItem[]>
export type CanvasSelectionIds = string[]

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

export function getCanvasSelectionIdsFromSnapshot(
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

export function canvasItemsEqual(a: CanvasItem[], b: CanvasItem[]) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function canvasItemPathToPointer(path: number[]): Pointer {
  return `/${path
    .flatMap((index, depth) =>
      depth === 0 ? [String(index)] : ['children', String(index)],
    )
    .join('/')}` as Pointer
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

function assertJSONResult(result: JSONResult): asserts result is { ok: true } {
  if (!result.ok) {
    throw new Error(result.reason ?? result.code)
  }
}

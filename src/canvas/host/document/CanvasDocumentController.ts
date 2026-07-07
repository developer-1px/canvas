import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import {
  commitCanvasItemsChange,
  type CanvasItemsChange,
} from './CanvasDocumentChanges'
import type { CanvasItemValidationOptions } from './CanvasItemSchema'
import type { CanvasItemTextTarget } from '../text/CanvasWhiteboardTextTarget'
import {
  commitCanvasDocumentSelection,
  commitCanvasItemsPatch,
  createCanvasItemsDocument,
  createReplaceCanvasDocumentTextPatch,
  findCanvasDocumentText,
  getCanvasDocumentSelectionIds,
  replaceCanvasItems,
  restoreCanvasDocumentSelection,
  type CanvasTextSearchMatch,
  type CanvasTextSearchOptions,
} from './CanvasDocument'
import {
  copyCanvasDocumentSelectionToClipboard,
  readCanvasDocumentClipboardItems,
  writeCanvasDocumentClipboardItems,
} from './CanvasDocumentClipboard'

export type CanvasDocumentSelectionHistory = {
  before: CanvasSelectionIds
  after: CanvasSelectionIds
}

export type CanvasDocumentHistoryAvailability = {
  canRedo: boolean
  canUndo: boolean
}

export type CanvasDocumentTextSearch = {
  findDocumentText: (
    text: string,
    options?: CanvasTextSearchOptions,
  ) => CanvasTextSearchMatch[]
  replaceDocumentText: (
    searchText: string,
    replacement: string,
    options?: CanvasTextSearchOptions,
  ) => boolean
}

export type CanvasDocumentClipboard = {
  copyItemsToClipboard: (selection: CanvasSelectionIds) => boolean
  getClipboardItems: () => CanvasItem[]
  setClipboardItems: (items: CanvasItem[]) => boolean
}

export type CanvasDocumentHistoryResult = {
  items: CanvasItem[]
  selection: CanvasSelectionIds
}

export type CanvasDocumentController = {
  commitItemsChange: (
    change: CanvasItemsChange,
    currentItems: CanvasItem[],
    selection?: CanvasDocumentSelectionHistory,
  ) => boolean
  commitSelection: (ids: CanvasSelectionIds) => boolean
  copySelectionToClipboard: (
    selection: CanvasSelectionIds,
    items?: CanvasItem[],
  ) => boolean
  findText: CanvasDocumentTextSearch['findDocumentText']
  readClipboardItems: () => CanvasItem[]
  readHistoryAvailability: () => CanvasDocumentHistoryAvailability
  readItems: () => CanvasItem[]
  readSelection: () => CanvasSelectionIds
  redo: (currentItems: CanvasItem[]) => CanvasDocumentHistoryResult | null
  replaceItems: (currentItems: CanvasItem[], nextItems: CanvasItem[]) => CanvasItem[]
  replaceText: (
    searchText: string,
    replacement: string,
    selection: CanvasSelectionIds,
    options?: CanvasTextSearchOptions,
  ) => boolean
  restoreSelection: (ids: CanvasSelectionIds, items?: CanvasItem[]) => void
  subscribeSelection: (onChange: () => void) => (() => void) | undefined
  undo: (currentItems: CanvasItem[]) => CanvasDocumentHistoryResult | null
  writeClipboardItems: (items: CanvasItem[]) => boolean
}

export function createCanvasDocumentController(
  initialItems: CanvasItem[],
  initialSelection: CanvasSelectionIds = [],
  validation: CanvasItemValidationOptions = {},
  textTarget?: CanvasItemTextTarget,
): CanvasDocumentController {
  const document = createCanvasItemsDocument(initialItems, {
    selection: initialSelection,
    ...validation,
  })

  return {
    commitItemsChange(
      change: CanvasItemsChange,
      currentItems: CanvasItem[],
      selection?: CanvasDocumentSelectionHistory,
    ) {
      return containCanvasDocumentMutation(false, () =>
        commitCanvasItemsChange({
          change,
          currentItems,
          document,
          selection,
          textTarget,
          validation,
        }),
      )
    },
    commitSelection(ids: CanvasSelectionIds) {
      return commitCanvasDocumentSelection(document, ids)
    },
    copySelectionToClipboard(
      selection: CanvasSelectionIds,
      items: CanvasItem[] = document.value,
    ) {
      return copyCanvasDocumentSelectionToClipboard(document, selection, items)
    },
    findText(text: string, options?: CanvasTextSearchOptions) {
      return findCanvasDocumentText(document, text, options)
    },
    readClipboardItems() {
      return readCanvasDocumentClipboardItems(document, validation)
    },
    readHistoryAvailability(): CanvasDocumentHistoryAvailability {
      return {
        canRedo: document.canRedo().ok,
        canUndo: document.canUndo().ok,
      }
    },
    readItems() {
      return document.value
    },
    readSelection() {
      return getCanvasDocumentSelectionIds(document)
    },
    redo(currentItems: CanvasItem[]) {
      if (!document.history.redo()) {
        return null
      }

      return {
        items: replaceCanvasItems(currentItems, document.value, validation),
        selection: getCanvasDocumentSelectionIds(document),
      }
    },
    replaceItems(currentItems: CanvasItem[], nextItems: CanvasItem[]) {
      return containCanvasDocumentMutation(currentItems, () =>
        replaceCanvasItems(currentItems, nextItems, validation),
      )
    },
    replaceText(
      searchText: string,
      replacement: string,
      selection: CanvasSelectionIds,
      options?: CanvasTextSearchOptions,
    ) {
      return containCanvasDocumentMutation(false, () =>
        commitCanvasItemsPatch({
          document,
          patch: createReplaceCanvasDocumentTextPatch(
            document,
            searchText,
            replacement,
            options,
          ),
          selection: {
            before: selection,
            after: selection,
          },
          validation,
        }),
      )
    },
    restoreSelection(ids: CanvasSelectionIds, items: CanvasItem[] = document.value) {
      restoreCanvasDocumentSelection(document, ids, items)
    },
    subscribeSelection(onChange: () => void) {
      return document.selection?.subscribe(onChange)
    },
    undo(currentItems: CanvasItem[]) {
      if (!document.history.undo()) {
        return null
      }

      return {
        items: replaceCanvasItems(currentItems, document.value, validation),
        selection: getCanvasDocumentSelectionIds(document),
      }
    },
    writeClipboardItems(items: CanvasItem[]) {
      return writeCanvasDocumentClipboardItems(document, items, validation)
    },
  }
}

function containCanvasDocumentMutation<T>(fallback: T, mutate: () => T) {
  try {
    return mutate()
  } catch {
    return fallback
  }
}

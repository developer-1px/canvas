import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../../entities'
import type {
  CanvasAppDocumentSelectionHistory,
  CanvasAppDocumentTextSearch,
  CanvasAppItemsChange,
  CanvasAppTextSearchOptions,
} from './CanvasAppDocumentContracts'

export type CanvasDocumentStateAction<T> = T | ((current: T) => T)

export type CanvasDocumentRuntimeHistoryAvailability = {
  canRedo: boolean
  canUndo: boolean
}

export type CanvasDocumentCommittedState = {
  historyAvailability: CanvasDocumentRuntimeHistoryAvailability
  items: CanvasItem[]
}

export type CanvasDocumentHistoryState = CanvasDocumentCommittedState & {
  selection: string[]
}

export type ReplaceCanvasDocumentLiveItemsArgs = {
  action: CanvasDocumentStateAction<CanvasItem[]>
  currentItems: CanvasItem[]
  document: CanvasDocumentRuntimeController
}

export type CommitCanvasDocumentItemsChangeArgs = {
  change: CanvasAppItemsChange
  currentItems: CanvasItem[]
  document: CanvasDocumentRuntimeController
  selection?: CanvasAppDocumentSelectionHistory
}

export type RestoreCanvasDocumentSelectionArgs = {
  action: CanvasDocumentStateAction<string[]>
  currentItems: CanvasItem[]
  document: CanvasDocumentRuntimeController
}

export type CommitCanvasDocumentSelectionArgs = {
  action: CanvasDocumentStateAction<string[]>
  document: CanvasDocumentRuntimeController
}

export type ReplaceCanvasDocumentTextArgs = {
  document: CanvasDocumentRuntimeController
  options?: CanvasAppTextSearchOptions
  replacement: string
  searchText: string
}

export type CanvasDocumentHistoryArgs = {
  currentItems: CanvasItem[]
  document: CanvasDocumentRuntimeController
}

export type CanvasDocumentHistoryRuntimeResult = {
  items: CanvasItem[]
  selection: CanvasSelectionIds
} | null

export type CanvasDocumentRuntimeController = {
  commitItemsChange: (
    change: CanvasAppItemsChange,
    currentItems: CanvasItem[],
    selection?: CanvasAppDocumentSelectionHistory,
  ) => boolean
  commitSelection: (ids: CanvasSelectionIds) => boolean
  findText: CanvasAppDocumentTextSearch['findDocumentText']
  readHistoryAvailability: () => CanvasDocumentRuntimeHistoryAvailability
  readItems: () => CanvasItem[]
  readSelection: () => CanvasSelectionIds
  redo: (currentItems: CanvasItem[]) => CanvasDocumentHistoryRuntimeResult
  replaceItems: (
    currentItems: CanvasItem[],
    nextItems: CanvasItem[],
  ) => CanvasItem[]
  replaceText: (
    searchText: string,
    replacement: string,
    selection: CanvasSelectionIds,
    options?: CanvasAppTextSearchOptions,
  ) => boolean
  restoreSelection: (ids: CanvasSelectionIds, items?: CanvasItem[]) => void
  undo: (currentItems: CanvasItem[]) => CanvasDocumentHistoryRuntimeResult
}

import type {
  CanvasItem,
  CanvasDocumentController,
  CanvasDocumentHistoryAvailability,
  CanvasDocumentHistoryResult,
  CanvasDocumentSelectionHistory,
  CanvasItemsChange,
  CanvasTextSearchOptions,
} from '../../host'

export type CanvasDocumentStateAction<T> = T | ((current: T) => T)

export type CanvasDocumentRuntimeController = CanvasDocumentController

export type CanvasDocumentRuntimeHistoryAvailability =
  CanvasDocumentHistoryAvailability

export type CanvasDocumentCommittedState = {
  historyAvailability: CanvasDocumentHistoryAvailability
  items: CanvasItem[]
}

export type CanvasDocumentHistoryState = CanvasDocumentCommittedState & {
  selection: string[]
}

export type ReplaceCanvasDocumentLiveItemsArgs = {
  action: CanvasDocumentStateAction<CanvasItem[]>
  currentItems: CanvasItem[]
  document: CanvasDocumentController
}

export type CommitCanvasDocumentItemsChangeArgs = {
  change: CanvasItemsChange
  currentItems: CanvasItem[]
  document: CanvasDocumentController
  selection?: CanvasDocumentSelectionHistory
}

export type RestoreCanvasDocumentSelectionArgs = {
  action: CanvasDocumentStateAction<string[]>
  currentItems: CanvasItem[]
  document: CanvasDocumentController
}

export type CommitCanvasDocumentSelectionArgs = {
  action: CanvasDocumentStateAction<string[]>
  document: CanvasDocumentController
}

export type ReplaceCanvasDocumentTextArgs = {
  document: CanvasDocumentController
  options?: CanvasTextSearchOptions
  replacement: string
  searchText: string
}

export type CanvasDocumentHistoryArgs = {
  currentItems: CanvasItem[]
  document: CanvasDocumentController
}

export type CanvasDocumentHistoryRuntimeResult =
  CanvasDocumentHistoryResult | null

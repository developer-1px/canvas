import type {
  CanvasDocumentCommittedState,
  CanvasDocumentHistoryArgs,
  CanvasDocumentHistoryRuntimeResult,
  CanvasDocumentHistoryState,
  CanvasDocumentRuntimeController,
  CanvasDocumentRuntimeHistoryAvailability,
  CanvasDocumentStateAction,
  CommitCanvasDocumentItemsChangeArgs,
  CommitCanvasDocumentSelectionArgs,
  ReplaceCanvasDocumentLiveItemsArgs,
  ReplaceCanvasDocumentTextArgs,
  RestoreCanvasDocumentSelectionArgs,
} from './CanvasDocumentRuntimeContracts'

export type {
  CanvasDocumentCommittedState,
  CanvasDocumentStateAction,
} from './CanvasDocumentRuntimeContracts'

export function replaceCanvasDocumentLiveItems({
  action,
  currentItems,
  document,
}: ReplaceCanvasDocumentLiveItemsArgs) {
  return document.replaceItems(
    currentItems,
    resolveCanvasDocumentStateAction(action, currentItems),
  )
}

export function readCanvasCommittedDocumentState(
  document: CanvasDocumentRuntimeController,
): CanvasDocumentCommittedState {
  return {
    historyAvailability: document.readHistoryAvailability(),
    items: document.readItems(),
  }
}

export function commitCanvasDocumentItemsChange({
  change,
  currentItems,
  document,
  selection,
}: CommitCanvasDocumentItemsChangeArgs): CanvasDocumentCommittedState | null {
  const didCommit = document.commitItemsChange(change, currentItems, selection)

  return didCommit
    ? readCanvasCommittedDocumentState(document)
    : null
}

export function restoreCanvasDocumentSelection({
  action,
  currentItems,
  document,
}: RestoreCanvasDocumentSelectionArgs) {
  document.restoreSelection(
    resolveCanvasDocumentStateAction(action, document.readSelection()),
    currentItems,
  )
}

export function commitCanvasDocumentSelection({
  action,
  document,
}: CommitCanvasDocumentSelectionArgs):
  CanvasDocumentRuntimeHistoryAvailability | null {
  const didCommit = document.commitSelection(
    resolveCanvasDocumentStateAction(action, document.readSelection()),
  )

  return didCommit
    ? document.readHistoryAvailability()
    : null
}

export function replaceCanvasDocumentText({
  document,
  options,
  replacement,
  searchText,
}: ReplaceCanvasDocumentTextArgs): CanvasDocumentCommittedState | null {
  const didCommit = document.replaceText(
    searchText,
    replacement,
    document.readSelection(),
    options,
  )

  return didCommit
    ? readCanvasCommittedDocumentState(document)
    : null
}

export function applyCanvasDocumentHistoryResult(
  result: CanvasDocumentHistoryRuntimeResult,
  document: CanvasDocumentHistoryArgs['document'],
): CanvasDocumentHistoryState | null {
  return result
    ? {
        historyAvailability: document.readHistoryAvailability(),
        items: result.items,
        selection: result.selection,
      }
    : null
}

export function undoCanvasDocumentHistory({
  currentItems,
  document,
}: CanvasDocumentHistoryArgs) {
  return applyCanvasDocumentHistoryResult(
    document.undo(currentItems),
    document,
  )
}

export function redoCanvasDocumentHistory({
  currentItems,
  document,
}: CanvasDocumentHistoryArgs) {
  return applyCanvasDocumentHistoryResult(
    document.redo(currentItems),
    document,
  )
}

function resolveCanvasDocumentStateAction<T>(
  action: CanvasDocumentStateAction<T>,
  current: T,
): T {
  return typeof action === 'function'
    ? (action as (current: T) => T)(current)
    : action
}

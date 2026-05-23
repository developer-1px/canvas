import type { CanvasItem } from '../../entities'
import type {
  CanvasDocumentController,
  CanvasDocumentHistoryAvailability,
} from '../../host'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
  CanvasDocumentTextSearch,
} from '../workflow/CanvasWorkflowContract'

export type CanvasDocumentStateAction<T> = T | ((current: T) => T)

type CanvasDocumentCommittedState = {
  historyAvailability: CanvasDocumentHistoryAvailability
  items: CanvasItem[]
}

type ReplaceCanvasDocumentLiveItemsArgs = {
  action: CanvasDocumentStateAction<CanvasItem[]>
  currentItems: CanvasItem[]
  document: CanvasDocumentController
}

type CommitCanvasDocumentItemsChangeArgs = {
  change: Parameters<CommitCanvasItemsChange>[0]
  currentItems: CanvasItem[]
  document: CanvasDocumentController
  selection?: Parameters<CommitCanvasItemsChange>[1]
}

type RestoreCanvasDocumentSelectionArgs = {
  action: Parameters<CommitCanvasSelection>[0]
  currentItems: CanvasItem[]
  document: CanvasDocumentController
}

type CommitCanvasDocumentSelectionArgs = {
  action: Parameters<CommitCanvasSelection>[0]
  document: CanvasDocumentController
}

type ReplaceCanvasDocumentTextArgs = {
  document: CanvasDocumentController
  options?: Parameters<CanvasDocumentTextSearch['replaceDocumentText']>[2]
  replacement: string
  searchText: string
}

type CanvasDocumentHistoryArgs = {
  currentItems: CanvasItem[]
  document: CanvasDocumentController
}

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
  document: CanvasDocumentController,
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
}: CommitCanvasDocumentSelectionArgs): CanvasDocumentHistoryAvailability | null {
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
  result: ReturnType<CanvasDocumentController['undo']>,
  document: CanvasDocumentController,
): (CanvasDocumentCommittedState & { selection: string[] }) | null {
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

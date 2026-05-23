import type { EditingText } from '../../entities'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

export type CanvasEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasStandardCommandDocumentEffectContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  redo: () => string[] | undefined
  selection: string[]
  setEditing: (editing: CanvasEditingUpdate) => void
  setSelection: (selection: string[]) => void
  undo: () => string[] | undefined
}

type CanvasStandardCommandItemsChange =
  Parameters<CommitCanvasItemsChange>[0]

export type CanvasStandardCommandDocumentEffect =
  | {
      afterSelection?: string[]
      change: CanvasStandardCommandItemsChange
      clearEditingIds?: readonly string[]
      fallbackSelection?: string[]
      kind: 'items-change'
    }
  | {
      direction: 'redo' | 'undo'
      kind: 'history'
    }
  | {
      kind: 'selection'
      selection: string[]
    }

export function applyCanvasStandardDocumentEffect({
  context,
  effect,
}: {
  context: CanvasStandardCommandDocumentEffectContext
  effect: CanvasStandardCommandDocumentEffect
}) {
  switch (effect.kind) {
    case 'items-change':
      return applyCanvasStandardItemsChangeEffect({
        afterSelection: effect.afterSelection,
        change: effect.change,
        clearEditingIds: effect.clearEditingIds,
        context,
        fallbackSelection: effect.fallbackSelection,
      })
    case 'history':
      return applyCanvasStandardHistoryEffect({
        context,
        direction: effect.direction,
      })
    case 'selection':
      return applyCanvasStandardSelectionEffect({
        context,
        selection: effect.selection,
      })
  }

  return assertUnhandledCanvasStandardDocumentEffect(effect)
}

export function applyCanvasStandardItemsChangeEffect({
  afterSelection,
  change,
  clearEditingIds,
  context,
  fallbackSelection,
}: {
  afterSelection?: string[]
  change: CanvasStandardCommandItemsChange
  clearEditingIds?: readonly string[]
  context: CanvasStandardCommandDocumentEffectContext
  fallbackSelection?: string[]
}) {
  const didCommit = context.commitItemsChange(
    change,
    {
      before: context.selection,
      after: afterSelection ?? context.selection,
    },
  )

  if (!didCommit && fallbackSelection) {
    context.commitSelection(fallbackSelection)
  }

  if (clearEditingIds && clearEditingIds.length > 0) {
    clearCanvasEditing(context, clearEditingIds)
  }

  return true
}

function assertUnhandledCanvasStandardDocumentEffect(
  effect: never,
): never {
  throw new Error(`Unhandled canvas standard document effect: ${String(effect)}`)
}

export function applyCanvasStandardSelectionEffect({
  context,
  selection,
}: {
  context: CanvasStandardCommandDocumentEffectContext
  selection: string[]
}) {
  context.commitSelection(selection)
  return true
}

function clearCanvasEditing(
  context: CanvasStandardCommandDocumentEffectContext,
  clearEditingIds: readonly string[],
) {
  context.setEditing((current) =>
    current && clearEditingIds.includes(current.id) ? null : current,
  )
}

export function applyCanvasStandardHistoryEffect({
  context,
  direction,
}: {
  context: CanvasStandardCommandDocumentEffectContext
  direction: 'redo' | 'undo'
}) {
  const restoredSelection =
    direction === 'undo' ? context.undo() : context.redo()

  context.setEditing(null)

  if (restoredSelection) {
    context.setSelection(restoredSelection)
  }

  return true
}

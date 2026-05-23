import type {
  CanvasItem,
  EditingText,
} from '../../entities'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

export type CanvasClipboardEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasClipboardCommandExecutionResult = {
  clonedItems: CanvasItem[]
  executed: boolean
  nextPasteIndex?: number
}

export type CanvasClipboardCommandEffectContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  selection: string[]
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  setEditing: (editing: CanvasClipboardEditingUpdate) => void
}

export type CanvasClipboardCommandEffect =
  | {
      clonedItems: CanvasItem[]
      kind: 'clone-result'
    }
  | {
      kind: 'copy-selection'
    }
  | {
      afterSelection: string[]
      items: CanvasItem[]
      kind: 'add-items'
      nextPasteIndex?: number
      updateClipboardItems?: CanvasItem[]
    }
  | {
      clearEditingIds: readonly string[]
      copyBeforeDelete: boolean
      deletionSelection: string[]
      kind: 'cut-selection'
    }
  | {
      copyBeforeDelete: boolean
      kind: 'cut-copy-only'
    }

export const EMPTY_CLIPBOARD_COMMAND_RESULT:
  CanvasClipboardCommandExecutionResult = {
    clonedItems: [],
    executed: false,
  }

export function applyCanvasClipboardCommandEffect({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: CanvasClipboardCommandEffect
}): CanvasClipboardCommandExecutionResult {
  switch (effect.kind) {
    case 'clone-result':
      return {
        clonedItems: effect.clonedItems,
        executed: true,
      }
    case 'copy-selection':
      return applyCanvasClipboardCopySelectionEffect(context)
    case 'add-items':
      return applyCanvasClipboardAddItemsEffect({ context, effect })
    case 'cut-selection':
      return applyCanvasClipboardCutSelectionEffect({ context, effect })
    case 'cut-copy-only':
      return applyCanvasClipboardCutCopyOnlyEffect({ context, effect })
  }

  return assertUnhandledCanvasClipboardCommandEffect(effect)
}

function applyCanvasClipboardCopySelectionEffect(
  context: CanvasClipboardCommandEffectContext,
): CanvasClipboardCommandExecutionResult {
  if (!context.copyItemsToClipboard(context.selection)) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  return {
    clonedItems: [],
    executed: true,
    nextPasteIndex: 0,
  }
}

function applyCanvasClipboardAddItemsEffect({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: Extract<CanvasClipboardCommandEffect, { kind: 'add-items' }>
}): CanvasClipboardCommandExecutionResult {
  const didCommit = context.commitItemsChange(
    { type: 'add', items: effect.items },
    {
      before: context.selection,
      after: effect.afterSelection,
    },
  )

  if (!didCommit) {
    return EMPTY_CLIPBOARD_COMMAND_RESULT
  }

  if (effect.updateClipboardItems) {
    context.setClipboardItems(effect.updateClipboardItems)
  }

  return {
    clonedItems: effect.items,
    executed: true,
    nextPasteIndex: effect.nextPasteIndex,
  }
}

function applyCanvasClipboardCutSelectionEffect({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: Extract<CanvasClipboardCommandEffect, { kind: 'cut-selection' }>
}): CanvasClipboardCommandExecutionResult {
  const copied = copyCanvasClipboardSelectionForCut({ context, effect })
  const didCommit = context.commitItemsChange(
    { type: 'remove-selection', selection: context.selection },
    {
      before: context.selection,
      after: effect.deletionSelection,
    },
  )

  if (!didCommit) {
    context.commitSelection(effect.deletionSelection)
  }

  context.setEditing((current) =>
    current && effect.clearEditingIds.includes(current.id)
      ? null
      : current,
  )

  return {
    clonedItems: [],
    executed: true,
    nextPasteIndex: copied.nextPasteIndex,
  }
}

function applyCanvasClipboardCutCopyOnlyEffect({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: Extract<CanvasClipboardCommandEffect, { kind: 'cut-copy-only' }>
}): CanvasClipboardCommandExecutionResult {
  const copied = copyCanvasClipboardSelectionForCut({ context, effect })

  return copied.nextPasteIndex === undefined
    ? EMPTY_CLIPBOARD_COMMAND_RESULT
    : {
        clonedItems: [],
        executed: true,
        nextPasteIndex: copied.nextPasteIndex,
      }
}

function copyCanvasClipboardSelectionForCut({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: { copyBeforeDelete: boolean }
}): { nextPasteIndex?: number } {
  return effect.copyBeforeDelete &&
    context.copyItemsToClipboard(context.selection)
    ? { nextPasteIndex: 0 }
    : {}
}

function assertUnhandledCanvasClipboardCommandEffect(
  effect: never,
): never {
  throw new Error(`Unhandled canvas clipboard command effect: ${String(effect)}`)
}

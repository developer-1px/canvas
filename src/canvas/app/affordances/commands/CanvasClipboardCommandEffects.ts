import type {
  CanvasClipboardCommandEffect,
  CanvasClipboardCommandEffectContext,
  CanvasClipboardCommandExecutionResult,
} from './CanvasClipboardCommandEffectContracts'

export const EMPTY_CLIPBOARD_COMMAND_RESULT:
  CanvasClipboardCommandExecutionResult = {
    clonedItems: [],
    executed: false,
  }

type CanvasClipboardCommandEffectApplier<
  TKind extends CanvasClipboardCommandEffect['kind'],
> = (args: {
  context: CanvasClipboardCommandEffectContext
  effect: Extract<CanvasClipboardCommandEffect, { kind: TKind }>
}) => CanvasClipboardCommandExecutionResult

type CanvasClipboardCommandEffectAppliers = {
  [TKind in CanvasClipboardCommandEffect['kind']]:
    CanvasClipboardCommandEffectApplier<TKind>
}

type CanvasClipboardCommandAnyEffectApplier = (args: {
  context: CanvasClipboardCommandEffectContext
  effect: CanvasClipboardCommandEffect
}) => CanvasClipboardCommandExecutionResult

const CANVAS_CLIPBOARD_COMMAND_EFFECT_APPLIERS = Object.freeze({
  'add-items': ({ context, effect }) =>
    applyCanvasClipboardAddItemsEffect({ context, effect }),
  'clone-result': ({ effect }) => ({
    clonedItems: effect.clonedItems,
    executed: true,
  }),
  'copy-selection': ({ context }) =>
    applyCanvasClipboardCopySelectionEffect(context),
  'cut-copy-only': ({ context, effect }) =>
    applyCanvasClipboardCutCopyOnlyEffect({ context, effect }),
  'cut-selection': ({ context, effect }) =>
    applyCanvasClipboardCutSelectionEffect({ context, effect }),
  'transform-items': ({ context, effect }) =>
    applyCanvasClipboardTransformItemsEffect({ context, effect }),
} satisfies CanvasClipboardCommandEffectAppliers)

export function applyCanvasClipboardCommandEffect({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: CanvasClipboardCommandEffect
}): CanvasClipboardCommandExecutionResult {
  const applier = CANVAS_CLIPBOARD_COMMAND_EFFECT_APPLIERS[
    effect.kind
  ] as CanvasClipboardCommandAnyEffectApplier

  return applier({ context, effect })
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

function applyCanvasClipboardTransformItemsEffect({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext
  effect: Extract<CanvasClipboardCommandEffect, { kind: 'transform-items' }>
}): CanvasClipboardCommandExecutionResult {
  const didCommit = context.commitItemsChange(
    {
      afterItems: effect.afterItems,
      beforeItems: effect.beforeItems,
      type: 'transform',
    },
    {
      after: effect.afterSelection,
      before: context.selection,
    },
  )

  return didCommit
    ? {
        clonedItems: effect.clonedItems,
        executed: true,
      }
    : EMPTY_CLIPBOARD_COMMAND_RESULT
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

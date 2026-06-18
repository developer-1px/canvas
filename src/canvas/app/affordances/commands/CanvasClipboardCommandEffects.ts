import type {
  CanvasCommandItem,
} from '../../../engine'
import type { CanvasItem } from '../../../entities'
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
> = <TItem extends CanvasCommandItem = CanvasItem>(args: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: Extract<CanvasClipboardCommandEffect<TItem>, { kind: TKind }>
}) => CanvasClipboardCommandExecutionResult<TItem>

type CanvasClipboardCommandEffectAppliers = {
  [TKind in CanvasClipboardCommandEffect['kind']]:
    CanvasClipboardCommandEffectApplier<TKind>
}

type CanvasClipboardCommandAnyEffectApplier =
  <TItem extends CanvasCommandItem = CanvasItem>(args: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: CanvasClipboardCommandEffect<TItem>
}) => CanvasClipboardCommandExecutionResult<TItem>

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

export function applyCanvasClipboardCommandEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: CanvasClipboardCommandEffect<TItem>
}): CanvasClipboardCommandExecutionResult<TItem> {
  const applier = CANVAS_CLIPBOARD_COMMAND_EFFECT_APPLIERS[
    effect.kind
  ] as CanvasClipboardCommandAnyEffectApplier

  return applier<TItem>({ context, effect })
}

function applyCanvasClipboardCopySelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>(
  context: CanvasClipboardCommandEffectContext<TItem>,
): CanvasClipboardCommandExecutionResult<TItem> {
  if (!context.copyItemsToClipboard(context.selection)) {
    return createEmptyCanvasClipboardCommandResult()
  }

  return {
    clonedItems: [],
    executed: true,
    nextPasteIndex: 0,
  }
}

function applyCanvasClipboardAddItemsEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: Extract<CanvasClipboardCommandEffect<TItem>, { kind: 'add-items' }>
}): CanvasClipboardCommandExecutionResult<TItem> {
  const didCommit = context.commitItemsChange(
    { type: 'add', items: effect.items },
    {
      before: context.selection,
      after: effect.afterSelection,
    },
  )

  if (!didCommit) {
    return createEmptyCanvasClipboardCommandResult()
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

function applyCanvasClipboardTransformItemsEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: Extract<
    CanvasClipboardCommandEffect<TItem>,
    { kind: 'transform-items' }
  >
}): CanvasClipboardCommandExecutionResult<TItem> {
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
    : createEmptyCanvasClipboardCommandResult()
}

function applyCanvasClipboardCutSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: Extract<
    CanvasClipboardCommandEffect<TItem>,
    { kind: 'cut-selection' }
  >
}): CanvasClipboardCommandExecutionResult<TItem> {
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

function applyCanvasClipboardCutCopyOnlyEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: Extract<
    CanvasClipboardCommandEffect<TItem>,
    { kind: 'cut-copy-only' }
  >
}): CanvasClipboardCommandExecutionResult<TItem> {
  const copied = copyCanvasClipboardSelectionForCut({ context, effect })

  return copied.nextPasteIndex === undefined
    ? createEmptyCanvasClipboardCommandResult()
    : {
        clonedItems: [],
        executed: true,
        nextPasteIndex: copied.nextPasteIndex,
      }
}

function copyCanvasClipboardSelectionForCut<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasClipboardCommandEffectContext<TItem>
  effect: { copyBeforeDelete: boolean }
}): { nextPasteIndex?: number } {
  return effect.copyBeforeDelete &&
    context.copyItemsToClipboard(context.selection)
    ? { nextPasteIndex: 0 }
    : {}
}

function createEmptyCanvasClipboardCommandResult<
  TItem extends CanvasCommandItem = CanvasItem,
>(): CanvasClipboardCommandExecutionResult<TItem> {
  return {
    clonedItems: [],
    executed: false,
  }
}

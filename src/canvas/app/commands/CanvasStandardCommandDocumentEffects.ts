import type {
  CanvasStandardCommandDocumentEffect,
  CanvasStandardCommandDocumentEffectContext,
  CanvasStandardCommandItemsChange,
} from './CanvasStandardCommandDocumentEffectContracts'

export type {
  CanvasEditingUpdate,
  CanvasStandardCommandDocumentEffect,
  CanvasStandardCommandDocumentEffectContext,
} from './CanvasStandardCommandDocumentEffectContracts'

type CanvasStandardReplaceChangedChange = Extract<
  CanvasStandardCommandItemsChange,
  { type: 'replace-changed' }
>
type CanvasStandardRemoveSelectionChange = Extract<
  CanvasStandardCommandItemsChange,
  { type: 'remove-selection' }
>
type CanvasStandardGroupSelectionChange = Extract<
  CanvasStandardCommandItemsChange,
  { type: 'group-selection' }
>
type CanvasStandardUngroupSelectionChange = Extract<
  CanvasStandardCommandItemsChange,
  { type: 'ungroup-selection' }
>
type CanvasStandardReorderSelectionChange = Extract<
  CanvasStandardCommandItemsChange,
  { type: 'reorder-selection' }
>

export function createCanvasStandardReplaceChangedEffect({
  afterSelection,
  fallbackSelection,
  items,
}: {
  afterSelection?: string[]
  fallbackSelection?: string[]
  items: CanvasStandardReplaceChangedChange['items']
}): CanvasStandardCommandDocumentEffect {
  return {
    afterSelection,
    change: { type: 'replace-changed', items },
    fallbackSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardRemoveSelectionEffect({
  afterSelection,
  clearEditingIds,
  selection,
}: {
  afterSelection: string[]
  clearEditingIds: readonly string[]
  selection: CanvasStandardRemoveSelectionChange['selection']
}): CanvasStandardCommandDocumentEffect {
  return {
    afterSelection,
    change: { type: 'remove-selection', selection },
    clearEditingIds,
    fallbackSelection: afterSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardGroupSelectionEffect({
  afterSelection,
  groupId,
  selection,
}: {
  afterSelection: string[]
  groupId: CanvasStandardGroupSelectionChange['groupId']
  selection: CanvasStandardGroupSelectionChange['selection']
}): CanvasStandardCommandDocumentEffect {
  return {
    afterSelection,
    change: { type: 'group-selection', groupId, selection },
    fallbackSelection: afterSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardUngroupSelectionEffect({
  afterSelection,
  selection,
}: {
  afterSelection: string[]
  selection: CanvasStandardUngroupSelectionChange['selection']
}): CanvasStandardCommandDocumentEffect {
  return {
    afterSelection,
    change: { type: 'ungroup-selection', selection },
    fallbackSelection: afterSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardReorderSelectionEffect({
  afterSelection,
  mode,
  selection,
}: {
  afterSelection: string[]
  mode: CanvasStandardReorderSelectionChange['mode']
  selection: CanvasStandardReorderSelectionChange['selection']
}): CanvasStandardCommandDocumentEffect {
  return {
    afterSelection,
    change: { type: 'reorder-selection', mode, selection },
    kind: 'items-change',
  }
}

export function createCanvasStandardHistoryEffect({
  direction,
}: {
  direction: 'redo' | 'undo'
}): CanvasStandardCommandDocumentEffect {
  return { direction, kind: 'history' }
}

export function createCanvasStandardSelectionEffect({
  selection,
}: {
  selection: string[]
}): CanvasStandardCommandDocumentEffect {
  return { kind: 'selection', selection }
}

type CanvasStandardDocumentEffectApplier<
  TKind extends CanvasStandardCommandDocumentEffect['kind'],
> = (args: {
  context: CanvasStandardCommandDocumentEffectContext
  effect: Extract<CanvasStandardCommandDocumentEffect, { kind: TKind }>
}) => boolean

type CanvasStandardDocumentEffectAppliers = {
  [TKind in CanvasStandardCommandDocumentEffect['kind']]:
    CanvasStandardDocumentEffectApplier<TKind>
}

type CanvasStandardDocumentAnyEffectApplier = (args: {
  context: CanvasStandardCommandDocumentEffectContext
  effect: CanvasStandardCommandDocumentEffect
}) => boolean

const CANVAS_STANDARD_DOCUMENT_EFFECT_APPLIERS = Object.freeze({
  history: ({ context, effect }) =>
    applyCanvasStandardHistoryEffect({
      context,
      direction: effect.direction,
    }),
  'items-change': ({ context, effect }) =>
    applyCanvasStandardItemsChangeEffect({
      afterSelection: effect.afterSelection,
      change: effect.change,
      clearEditingIds: effect.clearEditingIds,
      context,
      fallbackSelection: effect.fallbackSelection,
    }),
  selection: ({ context, effect }) =>
    applyCanvasStandardSelectionEffect({
      context,
      selection: effect.selection,
    }),
} satisfies CanvasStandardDocumentEffectAppliers)

export function applyCanvasStandardDocumentEffect({
  context,
  effect,
}: {
  context: CanvasStandardCommandDocumentEffectContext
  effect: CanvasStandardCommandDocumentEffect
}) {
  const applier = CANVAS_STANDARD_DOCUMENT_EFFECT_APPLIERS[
    effect.kind
  ] as CanvasStandardDocumentAnyEffectApplier

  return applier({ context, effect })
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

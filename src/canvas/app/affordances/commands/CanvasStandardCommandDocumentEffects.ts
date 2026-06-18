import type { CanvasCommandItem } from '../../../engine'
import type { CanvasItem } from '../../../entities'
import type {
  CanvasStandardCommandDocumentEffect,
  CanvasStandardCommandDocumentEffectContext,
  CanvasStandardCommandItemsChange,
} from './CanvasStandardCommandDocumentEffectContracts'

type CanvasStandardReplaceChangedChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = Extract<
  CanvasStandardCommandItemsChange<TItem>,
  { type: 'replace-changed' }
>
type CanvasStandardRemoveSelectionChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = Extract<
  CanvasStandardCommandItemsChange<TItem>,
  { type: 'remove-selection' }
>
type CanvasStandardGroupSelectionChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = Extract<
  CanvasStandardCommandItemsChange<TItem>,
  { type: 'group-selection' }
>
type CanvasStandardUngroupSelectionChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = Extract<
  CanvasStandardCommandItemsChange<TItem>,
  { type: 'ungroup-selection' }
>
type CanvasStandardReorderSelectionChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = Extract<
  CanvasStandardCommandItemsChange<TItem>,
  { type: 'reorder-selection' }
>

export function createCanvasStandardReplaceChangedEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  fallbackSelection,
  items,
}: {
  afterSelection?: string[]
  fallbackSelection?: string[]
  items: CanvasStandardReplaceChangedChange<TItem>['items']
}): CanvasStandardCommandDocumentEffect<TItem> {
  return {
    afterSelection,
    change: { type: 'replace-changed', items },
    fallbackSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardRemoveSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  clearEditingIds,
  selection,
}: {
  afterSelection: string[]
  clearEditingIds: readonly string[]
  selection: CanvasStandardRemoveSelectionChange<TItem>['selection']
}): CanvasStandardCommandDocumentEffect<TItem> {
  return {
    afterSelection,
    change: { type: 'remove-selection', selection },
    clearEditingIds,
    fallbackSelection: afterSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardGroupSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  groupId,
  selection,
}: {
  afterSelection: string[]
  groupId: CanvasStandardGroupSelectionChange<TItem>['groupId']
  selection: CanvasStandardGroupSelectionChange<TItem>['selection']
}): CanvasStandardCommandDocumentEffect<TItem> {
  return {
    afterSelection,
    change: { type: 'group-selection', groupId, selection },
    fallbackSelection: afterSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardUngroupSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  selection,
}: {
  afterSelection: string[]
  selection: CanvasStandardUngroupSelectionChange<TItem>['selection']
}): CanvasStandardCommandDocumentEffect<TItem> {
  return {
    afterSelection,
    change: { type: 'ungroup-selection', selection },
    fallbackSelection: afterSelection,
    kind: 'items-change',
  }
}

export function createCanvasStandardReorderSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  mode,
  selection,
}: {
  afterSelection: string[]
  mode: CanvasStandardReorderSelectionChange<TItem>['mode']
  selection: CanvasStandardReorderSelectionChange<TItem>['selection']
}): CanvasStandardCommandDocumentEffect<TItem> {
  return {
    afterSelection,
    change: { type: 'reorder-selection', mode, selection },
    kind: 'items-change',
  }
}

export function createCanvasStandardHistoryEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  direction,
}: {
  direction: 'redo' | 'undo'
}): CanvasStandardCommandDocumentEffect<TItem> {
  return { direction, kind: 'history' }
}

export function createCanvasStandardSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  selection,
}: {
  selection: string[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return { kind: 'selection', selection }
}

type CanvasStandardDocumentEffectApplier<
  TKind extends CanvasStandardCommandDocumentEffect['kind'],
> = <TItem extends CanvasCommandItem = CanvasItem>(args: {
  context: CanvasStandardCommandDocumentEffectContext<TItem>
  effect: Extract<CanvasStandardCommandDocumentEffect<TItem>, { kind: TKind }>
}) => boolean

type CanvasStandardDocumentEffectAppliers = {
  [TKind in CanvasStandardCommandDocumentEffect['kind']]:
    CanvasStandardDocumentEffectApplier<TKind>
}

type CanvasStandardDocumentAnyEffectApplier =
  <TItem extends CanvasCommandItem = CanvasItem>(args: {
  context: CanvasStandardCommandDocumentEffectContext<TItem>
  effect: CanvasStandardCommandDocumentEffect<TItem>
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

export function applyCanvasStandardDocumentEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  effect,
}: {
  context: CanvasStandardCommandDocumentEffectContext<TItem>
  effect: CanvasStandardCommandDocumentEffect<TItem>
}) {
  const applier = CANVAS_STANDARD_DOCUMENT_EFFECT_APPLIERS[
    effect.kind
  ] as CanvasStandardDocumentAnyEffectApplier

  return applier<TItem>({ context, effect })
}

export function applyCanvasStandardItemsChangeEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  change,
  clearEditingIds,
  context,
  fallbackSelection,
}: {
  afterSelection?: string[]
  change: CanvasStandardCommandItemsChange<TItem>
  clearEditingIds?: readonly string[]
  context: CanvasStandardCommandDocumentEffectContext<TItem>
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

export function applyCanvasStandardSelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  selection,
}: {
  context: CanvasStandardCommandDocumentEffectContext<TItem>
  selection: string[]
}) {
  context.commitSelection(selection)
  return true
}

function clearCanvasEditing<TItem extends CanvasCommandItem = CanvasItem>(
  context: CanvasStandardCommandDocumentEffectContext<TItem>,
  clearEditingIds: readonly string[],
) {
  context.setEditing((current) =>
    current && clearEditingIds.includes(current.id) ? null : current,
  )
}

export function applyCanvasStandardHistoryEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  context,
  direction,
}: {
  context: CanvasStandardCommandDocumentEffectContext<TItem>
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

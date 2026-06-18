import type { CanvasCommandItem } from '../../../engine'
import type { CanvasItem } from '../../../entities'
import type {
  CanvasClipboardCommandEffect,
} from './CanvasClipboardCommandEffectContracts'

export type CanvasClipboardDuplicateResult<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  clones: TItem[]
  items: TItem[]
  selection: string[]
}

export type CanvasClipboardDeleteResult = {
  clearEditingIds: readonly string[]
  selection: string[]
}

export function createCanvasClipboardCopySelectionEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>(): CanvasClipboardCommandEffect<TItem> {
  return {
    kind: 'copy-selection',
  }
}

export function createCanvasClipboardCloneResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  clonedItems,
}: {
  clonedItems: TItem[]
}): CanvasClipboardCommandEffect<TItem> {
  return {
    clonedItems,
    kind: 'clone-result',
  }
}

export function createCanvasClipboardDuplicateResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  beforeItems,
  result,
}: {
  beforeItems: TItem[]
  result: CanvasClipboardDuplicateResult<TItem>
}): CanvasClipboardCommandEffect<TItem> {
  return {
    afterItems: result.items,
    afterSelection: result.selection,
    beforeItems,
    clonedItems: result.clones,
    kind: 'transform-items',
  }
}

export function createCanvasClipboardPasteResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  items,
  pasteIndex,
}: {
  items: TItem[]
  pasteIndex: number
}): CanvasClipboardCommandEffect<TItem> {
  return createCanvasClipboardAddItemsResultEffect({
    afterSelection: items.map((item) => item.id),
    items,
    nextPasteIndex: pasteIndex + 1,
    updateClipboardItems: items,
  })
}

export function createCanvasClipboardCutSelectionResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  copyBeforeDelete,
  deletion,
}: {
  copyBeforeDelete: boolean
  deletion: CanvasClipboardDeleteResult
}): CanvasClipboardCommandEffect<TItem> {
  return {
    clearEditingIds: deletion.clearEditingIds,
    copyBeforeDelete,
    deletionSelection: deletion.selection,
    kind: 'cut-selection',
  }
}

export function createCanvasClipboardCutCopyOnlyResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  copyBeforeDelete,
}: {
  copyBeforeDelete: boolean
}): CanvasClipboardCommandEffect<TItem> {
  return {
    copyBeforeDelete,
    kind: 'cut-copy-only',
  }
}

function createCanvasClipboardAddItemsResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  afterSelection,
  items,
  nextPasteIndex,
  updateClipboardItems,
}: {
  afterSelection: string[]
  items: TItem[]
  nextPasteIndex?: number
  updateClipboardItems?: TItem[]
}): CanvasClipboardCommandEffect<TItem> {
  const effect: CanvasClipboardCommandEffect<TItem> = {
    afterSelection,
    items,
    kind: 'add-items',
  }

  if (nextPasteIndex !== undefined) {
    effect.nextPasteIndex = nextPasteIndex
  }

  if (updateClipboardItems !== undefined) {
    effect.updateClipboardItems = updateClipboardItems
  }

  return effect
}

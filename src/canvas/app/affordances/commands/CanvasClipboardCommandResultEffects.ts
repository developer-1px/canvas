import type { CanvasItem } from '../../../entities'
import type {
  CanvasClipboardCommandEffect,
} from './CanvasClipboardCommandEffectContracts'

export type CanvasClipboardDuplicateResult = {
  clones: CanvasItem[]
  items: CanvasItem[]
  selection: string[]
}

export type CanvasClipboardDeleteResult = {
  clearEditingIds: readonly string[]
  selection: string[]
}

export function createCanvasClipboardCopySelectionEffect():
  CanvasClipboardCommandEffect {
  return {
    kind: 'copy-selection',
  }
}

export function createCanvasClipboardCloneResultEffect({
  clonedItems,
}: {
  clonedItems: CanvasItem[]
}): CanvasClipboardCommandEffect {
  return {
    clonedItems,
    kind: 'clone-result',
  }
}

export function createCanvasClipboardDuplicateResultEffect({
  beforeItems,
  result,
}: {
  beforeItems: CanvasItem[]
  result: CanvasClipboardDuplicateResult
}): CanvasClipboardCommandEffect {
  return {
    afterItems: result.items,
    afterSelection: result.selection,
    beforeItems,
    clonedItems: result.clones,
    kind: 'transform-items',
  }
}

export function createCanvasClipboardPasteResultEffect({
  items,
  pasteIndex,
}: {
  items: CanvasItem[]
  pasteIndex: number
}): CanvasClipboardCommandEffect {
  return createCanvasClipboardAddItemsResultEffect({
    afterSelection: items.map((item) => item.id),
    items,
    nextPasteIndex: pasteIndex + 1,
    updateClipboardItems: items,
  })
}

export function createCanvasClipboardCutSelectionResultEffect({
  copyBeforeDelete,
  deletion,
}: {
  copyBeforeDelete: boolean
  deletion: CanvasClipboardDeleteResult
}): CanvasClipboardCommandEffect {
  return {
    clearEditingIds: deletion.clearEditingIds,
    copyBeforeDelete,
    deletionSelection: deletion.selection,
    kind: 'cut-selection',
  }
}

export function createCanvasClipboardCutCopyOnlyResultEffect({
  copyBeforeDelete,
}: {
  copyBeforeDelete: boolean
}): CanvasClipboardCommandEffect {
  return {
    copyBeforeDelete,
    kind: 'cut-copy-only',
  }
}

function createCanvasClipboardAddItemsResultEffect({
  afterSelection,
  items,
  nextPasteIndex,
  updateClipboardItems,
}: {
  afterSelection: string[]
  items: CanvasItem[]
  nextPasteIndex?: number
  updateClipboardItems?: CanvasItem[]
}): CanvasClipboardCommandEffect {
  const effect: CanvasClipboardCommandEffect = {
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

import type { Bounds } from '../core'
import type {
  CanvasSelectionLayoutEntry,
  CanvasSelectionLayoutInput,
} from './CanvasSelectionLayoutContracts'

export function canFlipCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>(input: CanvasSelectionLayoutInput<TItem, TItemId>) {
  return getSelectedCanvasSelectionLayoutEntries(input, 1) !== null
}

export function canAlignCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  frame,
  ...input
}: CanvasSelectionLayoutInput<TItem, TItemId> & { frame?: Bounds }) {
  const minimumSelectionCount = frame ? 1 : 2

  return getSelectedCanvasSelectionLayoutEntries(
    input,
    minimumSelectionCount,
  ) !== null
}

export function canDistributeCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>(input: CanvasSelectionLayoutInput<TItem, TItemId>) {
  return getSelectedCanvasSelectionLayoutEntries(input, 3) !== null
}

export function canTidyCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>(input: CanvasSelectionLayoutInput<TItem, TItemId>) {
  return getSelectedCanvasSelectionLayoutEntries(input, 3) !== null
}

export function getSelectedCanvasSelectionLayoutEntries<
  TItem,
  TItemId extends string = string,
>(
  {
    getItemBounds,
    getItemId,
    isItemSelectable = () => true,
    items,
    selection,
  }: CanvasSelectionLayoutInput<TItem, TItemId>,
  minCount: number,
): CanvasSelectionLayoutEntry<TItem, TItemId>[] | null {
  if (selection.length < minCount) {
    return null
  }

  const selectedIds = new Set<TItemId>(selection)
  const entries: CanvasSelectionLayoutEntry<TItem, TItemId>[] = []

  items.forEach((item, index) => {
    const id = getItemId(item, index)

    if (selectedIds.has(id) && isItemSelectable(item, index)) {
      entries.push({
        bounds: getItemBounds(item, index),
        id,
        index,
        item,
      })
    }
  })

  return entries.length === selection.length ? entries : null
}

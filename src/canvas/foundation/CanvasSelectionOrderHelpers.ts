export function getSelectedCanvasSelectionOrderIds<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable,
  items,
  selection,
}: {
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
}) {
  const selectionIds = new Set(selection)
  const selected = new Set<TItemId>()

  items.forEach((item, index) => {
    const id = getItemId(item, index)

    if (selectionIds.has(id) && isItemSelectable(item, index)) {
      selected.add(id)
    }
  })

  return selected
}

export function areCanvasSelectionItemOrdersEqual<
  TItem,
  TItemId extends string = string,
>(
  left: readonly TItem[],
  right: readonly TItem[],
  getItemId: (item: TItem, index: number) => TItemId,
) {
  return left.length === right.length &&
    left.every((item, index) => {
      const rightItem = right[index]

      return rightItem !== undefined &&
        getItemId(item, index) === getItemId(rightItem, index)
    })
}

export function clampCanvasSelectionItemIndex(index: number, length: number) {
  return Math.max(0, Math.min(length, index))
}

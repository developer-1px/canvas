export type CanvasSameTypeSelectionInput<
  TItem,
  TItemId extends string = string,
  TTypeKey extends string = string,
> = {
  getItemId: (item: TItem, index: number) => TItemId
  getItemType: (item: TItem, index: number) => TTypeKey
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
}

export function selectSameTypeCanvasItems<
  TItem,
  TItemId extends string = string,
  TTypeKey extends string = string,
>({
  getItemId,
  getItemType,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasSameTypeSelectionInput<TItem, TItemId, TTypeKey>): TItemId[] {
  const selectedIds = new Set<TItemId>(selection)
  const selectedTypeKeys = new Set<TTypeKey>()

  items.forEach((item, index) => {
    const itemId = getItemId(item, index)

    if (selectedIds.has(itemId) && isItemSelectable(item, index)) {
      selectedTypeKeys.add(getItemType(item, index))
    }
  })

  if (selectedTypeKeys.size === 0) {
    return [...selection]
  }

  const emittedIds = new Set<TItemId>()
  const sameTypeIds: TItemId[] = []

  items.forEach((item, index) => {
    const itemId = getItemId(item, index)

    if (
      emittedIds.has(itemId) ||
      !isItemSelectable(item, index) ||
      !selectedTypeKeys.has(getItemType(item, index))
    ) {
      return
    }

    emittedIds.add(itemId)
    sameTypeIds.push(itemId)
  })

  return sameTypeIds
}

export function canSelectSameTypeCanvasItems<
  TItem,
  TItemId extends string = string,
  TTypeKey extends string = string,
>(
  input: CanvasSameTypeSelectionInput<TItem, TItemId, TTypeKey>,
) {
  if (input.selection.length === 0) {
    return false
  }

  const selectedIds = new Set<TItemId>(input.selection)

  return selectSameTypeCanvasItems(input).some((itemId) =>
    !selectedIds.has(itemId)
  )
}

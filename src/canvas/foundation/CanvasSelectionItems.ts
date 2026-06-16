export type CanvasSelectionItemsInput<
  TItem,
  TItemId extends string = string,
> = {
  getItemId: (item: TItem, index: number) => TItemId
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: readonly TItem[]
  selection: readonly TItemId[]
}

export type CanvasSelectionItemsChangeInput<
  TItem,
  TItemId extends string = string,
> = Omit<CanvasSelectionItemsInput<TItem, TItemId>, 'items'> & {
  items: TItem[]
}

export type CanvasSelectionMapItemsInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionItemsChangeInput<TItem, TItemId> & {
  mapItem: (item: TItem, index: number) => TItem
}

export function getCanvasSelectableItemIds<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
}: Omit<CanvasSelectionItemsInput<TItem, TItemId>, 'selection'>) {
  const ids: TItemId[] = []

  items.forEach((item, index) => {
    if (isItemSelectable(item, index)) {
      ids.push(getItemId(item, index))
    }
  })

  return ids
}

export function getCanvasSelectedItemIds<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasSelectionItemsInput<TItem, TItemId>) {
  const selected = new Set(selection)
  const ids: TItemId[] = []

  items.forEach((item, index) => {
    const id = getItemId(item, index)

    if (selected.has(id) && isItemSelectable(item, index)) {
      ids.push(id)
    }
  })

  return ids
}

export function deleteCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasSelectionItemsChangeInput<TItem, TItemId>) {
  const selected = new Set(selection)

  return items.filter((item, index) =>
    !selected.has(getItemId(item, index)) || !isItemSelectable(item, index))
}

export function mapCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  mapItem,
  selection,
}: CanvasSelectionMapItemsInput<TItem, TItemId>) {
  const selected = new Set(selection)

  return items.map((item, index) =>
    selected.has(getItemId(item, index)) && isItemSelectable(item, index)
      ? mapItem(item, index)
      : item)
}

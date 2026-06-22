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

export type CanvasSelectionRemoveIdsInput<
  TItemId extends string = string,
> = {
  ids: ReadonlySet<TItemId> | readonly TItemId[]
  selection: readonly TItemId[]
}

export type CanvasSingleItemSelectionInput<
  TItemId extends string = string,
> = {
  additive: boolean
  itemId: TItemId
  selection: readonly TItemId[]
}

export type CanvasSelectionMapItemsInput<
  TItem,
  TItemId extends string = string,
> = CanvasSelectionItemsChangeInput<TItem, TItemId> & {
  mapItem: (item: TItem, index: number) => TItem
}

export type CanvasSelectionCloneItemInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = {
  cloneIndex: number
  index: number
  item: TItem
  sourceGroupId?: TGroupId
  sourceId: TItemId
  targetGroupId?: TGroupId
}

export type CanvasSelectionCloneItemsInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = CanvasSelectionItemsInput<TItem, TItemId> & {
  cloneItem: (
    input: CanvasSelectionCloneItemInput<TItem, TItemId, TGroupId>,
  ) => TItem
  createGroupId?: (sourceGroupId: TGroupId) => TGroupId | null | undefined
  getItemGroupId?: (item: TItem, index: number) => TGroupId | null | undefined
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

export function getCanvasSelectedItems<
  TItem,
  TItemId extends string = string,
>({
  getItemId,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasSelectionItemsInput<TItem, TItemId>) {
  const selected = new Set(selection)

  return items.filter((item, index) =>
    selected.has(getItemId(item, index)) && isItemSelectable(item, index))
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

export function removeCanvasSelectionIds<
  TItemId extends string = string,
>({
  ids,
  selection,
}: CanvasSelectionRemoveIdsInput<TItemId>) {
  const removed = ids instanceof Set ? ids : new Set(ids)

  return selection.filter((id) => !removed.has(id))
}

export function getCanvasSingleItemSelection<
  TItemId extends string = string,
>({
  additive,
  itemId,
  selection,
}: CanvasSingleItemSelectionInput<TItemId>) {
  if (!additive) {
    return [itemId]
  }

  return selection.includes(itemId)
    ? removeCanvasSelectionIds({ ids: [itemId], selection })
    : [...selection, itemId]
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

export function cloneCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  cloneItem,
  createGroupId,
  getItemGroupId,
  getItemId,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasSelectionCloneItemsInput<TItem, TItemId, TGroupId>) {
  const selected = new Set(selection)
  const groupIdBySource = new Map<TGroupId, TGroupId | undefined>()
  const clones: TItem[] = []

  items.forEach((item, index) => {
    const sourceId = getItemId(item, index)

    if (!selected.has(sourceId) || !isItemSelectable(item, index)) {
      return
    }

    const sourceGroupId = getItemGroupId?.(item, index) ?? undefined
    const targetGroupId = sourceGroupId === undefined
      ? undefined
      : getCanvasSelectionCloneTargetGroupId({
        createGroupId,
        groupIdBySource,
        sourceGroupId,
      })

    clones.push(cloneItem({
      cloneIndex: clones.length,
      index,
      item,
      sourceGroupId,
      sourceId,
      targetGroupId,
    }))
  })

  return clones
}

function getCanvasSelectionCloneTargetGroupId<TGroupId extends string>({
  createGroupId,
  groupIdBySource,
  sourceGroupId,
}: {
  createGroupId?: (sourceGroupId: TGroupId) => TGroupId | null | undefined
  groupIdBySource: Map<TGroupId, TGroupId | undefined>
  sourceGroupId: TGroupId
}) {
  if (!groupIdBySource.has(sourceGroupId)) {
    groupIdBySource.set(
      sourceGroupId,
      createGroupId ? createGroupId(sourceGroupId) ?? undefined : sourceGroupId,
    )
  }

  return groupIdBySource.get(sourceGroupId)
}

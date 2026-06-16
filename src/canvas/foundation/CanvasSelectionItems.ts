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

export type CanvasSelectionItemGroupsInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = CanvasSelectionItemsInput<TItem, TItemId> & {
  getItemGroupId: (item: TItem, index: number) => TGroupId | null | undefined
}

export type CanvasSelectionItemGroupMembersInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = Omit<
  CanvasSelectionItemGroupsInput<TItem, TItemId, TGroupId>,
  'selection'
> & {
  itemId: TItemId
}

export type CanvasSelectionItemGroupInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = Omit<
  CanvasSelectionItemGroupsInput<TItem, TItemId, TGroupId>,
  'selection'
> & {
  groupId: TGroupId
}

export type CanvasGroupedItemSelectionInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = CanvasSelectionItemGroupInput<TItem, TItemId, TGroupId> & {
  additive: boolean
  fallbackSelection: readonly TItemId[]
  selection: readonly TItemId[]
}

export type CanvasGroupedItemPointerSelectionInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = CanvasSelectionItemGroupMembersInput<TItem, TItemId, TGroupId> & {
  additive: boolean
  fallbackSelection: readonly TItemId[]
  selection: readonly TItemId[]
}

export type CanvasSelectionUngroupItemInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = {
  groupId: TGroupId
  id: TItemId
  index: number
  item: TItem
}

export type CanvasSelectionUngroupItemsInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = CanvasSelectionItemsChangeInput<TItem, TItemId> & {
  getItemGroupId: (item: TItem, index: number) => TGroupId | null | undefined
  ungroupItem: (
    input: CanvasSelectionUngroupItemInput<TItem, TItemId, TGroupId>,
  ) => TItem
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

export function getCanvasSelectedItemGroupIds<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemGroupId,
  getItemId,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasSelectionItemGroupsInput<TItem, TItemId, TGroupId>) {
  const selected = new Set(selection)
  const seen = new Set<TGroupId>()
  const groupIds: TGroupId[] = []

  items.forEach((item, index) => {
    const id = getItemId(item, index)
    const groupId = getItemGroupId(item, index) ?? undefined

    if (
      selected.has(id) &&
      groupId !== undefined &&
      isItemSelectable(item, index) &&
      !seen.has(groupId)
    ) {
      seen.add(groupId)
      groupIds.push(groupId)
    }
  })

  return groupIds
}

export function getCanvasItemGroupMemberIds<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemGroupId,
  getItemId,
  isItemSelectable = () => true,
  itemId,
  items,
}: CanvasSelectionItemGroupMembersInput<TItem, TItemId, TGroupId>) {
  const groupId = getCanvasItemGroupId({
    getItemGroupId,
    getItemId,
    itemId,
    items,
  })

  if (groupId === undefined) {
    return []
  }

  return getCanvasItemGroupMemberIdsForGroup({
    getItemGroupId,
    getItemId,
    groupId,
    isItemSelectable,
    items,
  })
}

export function getCanvasItemGroupMemberIdsForGroup<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemGroupId,
  getItemId,
  groupId,
  isItemSelectable = () => true,
  items,
}: CanvasSelectionItemGroupInput<TItem, TItemId, TGroupId>) {
  const memberIds: TItemId[] = []

  items.forEach((item, index) => {
    const candidateGroupId = getItemGroupId(item, index) ?? undefined

    if (candidateGroupId === groupId && isItemSelectable(item, index)) {
      memberIds.push(getItemId(item, index))
    }
  })

  return memberIds
}

export function getCanvasGroupedItemSelection<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  additive,
  fallbackSelection,
  selection,
  ...input
}: CanvasGroupedItemSelectionInput<TItem, TItemId, TGroupId>) {
  return getCanvasSelectionFromGroupedMemberIds({
    additive,
    fallbackSelection,
    memberIds: getCanvasItemGroupMemberIdsForGroup(input),
    selection,
  })
}

export function getCanvasGroupedItemPointerSelection<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  additive,
  fallbackSelection,
  selection,
  ...input
}: CanvasGroupedItemPointerSelectionInput<TItem, TItemId, TGroupId>) {
  return getCanvasSelectionFromGroupedMemberIds({
    additive,
    fallbackSelection,
    memberIds: getCanvasItemGroupMemberIds(input),
    selection,
  })
}

export function ungroupCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemGroupId,
  getItemId,
  isItemSelectable,
  items,
  selection,
  ungroupItem,
}: CanvasSelectionUngroupItemsInput<TItem, TItemId, TGroupId>) {
  const groupIds = getCanvasSelectedItemGroupIds({
    getItemGroupId,
    getItemId,
    isItemSelectable,
    items,
    selection,
  })

  if (groupIds.length === 0) {
    return { items, selection: [] }
  }

  const selectedGroupIds = new Set(groupIds)
  const nextSelection: TItemId[] = []

  return {
    items: items.map((item, index) => {
      const groupId = getItemGroupId(item, index) ?? undefined

      if (groupId === undefined || !selectedGroupIds.has(groupId)) {
        return item
      }

      const id = getItemId(item, index)

      nextSelection.push(id)

      return ungroupItem({
        groupId,
        id,
        index,
        item,
      })
    }),
    selection: nextSelection,
  }
}

function getCanvasItemGroupId<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemGroupId,
  getItemId,
  itemId,
  items,
}: {
  getItemGroupId: (item: TItem, index: number) => TGroupId | null | undefined
  getItemId: (item: TItem, index: number) => TItemId
  itemId: TItemId
  items: readonly TItem[]
}) {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]

    if (item && getItemId(item, index) === itemId) {
      return getItemGroupId(item, index) ?? undefined
    }
  }

  return undefined
}

function getCanvasSelectionFromGroupedMemberIds<TItemId extends string>({
  additive,
  fallbackSelection,
  memberIds,
  selection,
}: {
  additive: boolean
  fallbackSelection: readonly TItemId[]
  memberIds: readonly TItemId[]
  selection: readonly TItemId[]
}) {
  if (memberIds.length === 0) {
    return [...fallbackSelection]
  }

  if (!additive) {
    return [...memberIds]
  }

  const selected = new Set(selection)
  const allMembersSelected = memberIds.every((id) => selected.has(id))

  if (allMembersSelected) {
    const members = new Set(memberIds)

    return selection.filter((id) => !members.has(id))
  }

  return [
    ...selection,
    ...memberIds.filter((id) => !selected.has(id)),
  ]
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

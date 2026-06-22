import type {
  CanvasGroupExpandedSelectionIdsInput,
  CanvasItemGroupIndexRange,
  CanvasItemGroupIndexRangeInput,
  CanvasSelectionItemGroupInput,
  CanvasSelectionItemGroupMembersInput,
  CanvasSelectionItemGroupsInput,
} from './CanvasSelectionItemGroupContracts'

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

export function getCanvasFullySelectedItemGroupIds<
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
  const groupState = new Map<TGroupId, boolean>()
  const groupIds: TGroupId[] = []

  items.forEach((item, index) => {
    const groupId = getItemGroupId(item, index) ?? undefined

    if (groupId === undefined || !isItemSelectable(item, index)) {
      return
    }

    if (!groupState.has(groupId)) {
      groupState.set(groupId, true)
      groupIds.push(groupId)
    }

    if (!selected.has(getItemId(item, index))) {
      groupState.set(groupId, false)
    }
  })

  return groupIds.filter((groupId) => groupState.get(groupId) === true)
}

export function getCanvasGroupExpandedSelectionIds<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemGroupId,
  getItemId,
  getSelectionGroupId,
  isItemSelectable = () => true,
  items,
  selection,
}: CanvasGroupExpandedSelectionIdsInput<TItem, TItemId, TGroupId>) {
  const itemIds = new Set<TItemId>()

  items.forEach((item, index) => {
    if (isItemSelectable(item, index)) {
      itemIds.add(getItemId(item, index))
    }
  })

  const expanded: TItemId[] = []
  const seen = new Set<TItemId>()
  const pushId = (id: TItemId) => {
    if (seen.has(id)) {
      return
    }

    seen.add(id)
    expanded.push(id)
  }

  for (const id of selection) {
    const groupId = getSelectionGroupId(id) ?? undefined

    if (groupId !== undefined) {
      for (const memberId of getCanvasItemGroupMemberIdsForGroup({
        getItemGroupId,
        getItemId,
        groupId,
        isItemSelectable,
        items,
      })) {
        pushId(memberId)
      }
      continue
    }

    if (itemIds.has(id)) {
      pushId(id)
    }
  }

  return expanded
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

export function getCanvasItemGroupIndexRange<
  TItem,
  TGroupId extends string = string,
>({
  getItemGroupId,
  groupId,
  isItemSelectable = () => true,
  items,
}: CanvasItemGroupIndexRangeInput<TItem, TGroupId>):
  CanvasItemGroupIndexRange | null {
  let firstIndex: number | null = null
  let lastIndex: number | null = null

  items.forEach((item, index) => {
    if (
      getItemGroupId(item, index) !== groupId ||
      !isItemSelectable(item, index)
    ) {
      return
    }

    firstIndex ??= index
    lastIndex = index
  })

  return firstIndex === null || lastIndex === null
    ? null
    : { firstIndex, lastIndex }
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

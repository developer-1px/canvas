import {
  getCanvasSelectedItemIds,
  mapCanvasSelectionItems,
} from './CanvasSelectionItemBasics'
import type {
  CanvasGroupedItemPointerSelectionInput,
  CanvasGroupedItemSelectionInput,
  CanvasSelectionGroupItemsInput,
  CanvasSelectionUngroupItemsInput,
} from './CanvasSelectionItemGroupContracts'
import {
  getCanvasItemGroupMemberIds,
  getCanvasItemGroupMemberIdsForGroup,
  getCanvasSelectedItemGroupIds,
} from './CanvasSelectionItemGroupQueries'

export function groupCanvasSelectionItems<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
>({
  getItemId,
  groupId,
  groupItem,
  isItemSelectable,
  items,
  selection,
}: CanvasSelectionGroupItemsInput<TItem, TItemId, TGroupId>) {
  const selectedItemIds = getCanvasSelectedItemIds({
    getItemId,
    isItemSelectable,
    items,
    selection,
  })

  if (selectedItemIds.length < 2) {
    return { items, selection: [...selection] }
  }

  return {
    items: mapCanvasSelectionItems({
      getItemId,
      isItemSelectable,
      items,
      mapItem: (item, index) =>
        groupItem({
          groupId,
          id: getItemId(item, index),
          index,
          item,
        }),
      selection: selectedItemIds,
    }),
    selection: selectedItemIds,
  }
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

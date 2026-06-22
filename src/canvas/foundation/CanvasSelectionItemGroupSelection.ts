import type {
  CanvasGroupExpandedSelectionIdsInput,
  CanvasGroupedItemPointerSelectionInput,
  CanvasGroupedItemSelectionInput,
} from './CanvasSelectionItemGroupContracts'
import {
  getCanvasItemGroupMemberIds,
  getCanvasItemGroupMemberIdsForGroup,
} from './CanvasSelectionItemGroupQueries'

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

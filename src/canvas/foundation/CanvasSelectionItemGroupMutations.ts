import {
  getCanvasSelectedItemIds,
  mapCanvasSelectionItems,
} from './CanvasSelectionItemBasics'
import type {
  CanvasSelectionGroupItemsInput,
  CanvasSelectionUngroupItemsInput,
} from './CanvasSelectionItemGroupContracts'
import {
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

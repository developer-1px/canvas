import type {
  CanvasSelectionItemsChangeInput,
  CanvasSelectionItemsInput,
} from './CanvasSelectionItemBasics'

export type CanvasSelectionGroupItemInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = {
  groupId: TGroupId
  id: TItemId
  index: number
  item: TItem
}

export type CanvasSelectionGroupItemsInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = CanvasSelectionItemsChangeInput<TItem, TItemId> & {
  groupId: TGroupId
  groupItem: (
    input: CanvasSelectionGroupItemInput<TItem, TItemId, TGroupId>,
  ) => TItem
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

export type CanvasGroupExpandedSelectionIdsInput<
  TItem,
  TItemId extends string = string,
  TGroupId extends string = string,
> = Omit<
  CanvasSelectionItemGroupsInput<TItem, TItemId, TGroupId>,
  'selection'
> & {
  getSelectionGroupId: (id: TItemId) => TGroupId | null | undefined
  selection: readonly TItemId[]
}

export type CanvasItemGroupIndexRangeInput<
  TItem,
  TGroupId extends string = string,
> = {
  getItemGroupId: (item: TItem, index: number) => TGroupId | null | undefined
  groupId: TGroupId
  isItemSelectable?: (item: TItem, index: number) => boolean
  items: readonly TItem[]
}

export type CanvasItemGroupIndexRange = {
  firstIndex: number
  lastIndex: number
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

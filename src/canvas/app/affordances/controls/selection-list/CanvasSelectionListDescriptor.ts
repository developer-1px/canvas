export const CANVAS_SELECTION_LIST_MODEL = 'canvas-selection-list'
export const CANVAS_SELECTION_LIST_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_SELECTION_LIST_KEYBOARD_MODEL =
  'aria-listbox-roving-focus'

export type CanvasSelectionListDescriptorSelectionMode = 'multiple' | 'single'

export type CanvasSelectionListItemInput<TId extends string = string> = {
  disabled?: boolean
  id: TId
  optionId?: string
}

export type CanvasSelectionListRootAttributes = {
  'aria-multiselectable': true | undefined
  id: string | undefined
  role: 'listbox'
}

export type CanvasSelectionListOptionAttributes = {
  'aria-disabled': true | undefined
  'aria-selected': boolean
  id: string
  role: 'option'
  tabIndex: -1 | 0 | undefined
}

export type CanvasSelectionListOptionDescriptor<
  TId extends string = string,
  TItem extends CanvasSelectionListItemInput<TId> =
    CanvasSelectionListItemInput<TId>,
> =
  TItem & {
    attributes: CanvasSelectionListOptionAttributes
    id: TId
    index: number
    isDisabled: boolean
    isFocusable: boolean
    isSelected: boolean
    optionId: string
  }

export type CanvasSelectionListDescriptor<
  TId extends string = string,
  TItem extends CanvasSelectionListItemInput<TId> =
    CanvasSelectionListItemInput<TId>,
> = {
  focusedId: TId | null
  focusModel: typeof CANVAS_SELECTION_LIST_FOCUS_MODEL
  focusableOptionId: string | null
  keyboardModel: typeof CANVAS_SELECTION_LIST_KEYBOARD_MODEL
  model: typeof CANVAS_SELECTION_LIST_MODEL
  options: CanvasSelectionListOptionDescriptor<TId, TItem>[]
  rootAttributes: CanvasSelectionListRootAttributes
  selectedIds: TId[]
  selectedOptionIds: string[]
  selectionMode: CanvasSelectionListDescriptorSelectionMode
}

export type CanvasSelectionListDescriptorInput<
  TId extends string = string,
  TItem extends CanvasSelectionListItemInput<TId> =
    CanvasSelectionListItemInput<TId>,
> = {
  focusedId?: TId | null
  getOptionId?: (id: TId, index: number) => string
  items: readonly TItem[]
  listId?: string
  selectedIds: readonly TId[]
  selectionMode?: CanvasSelectionListDescriptorSelectionMode
}

export function createCanvasSelectionListDescriptor<
  TId extends string,
  TItem extends CanvasSelectionListItemInput<TId> =
    CanvasSelectionListItemInput<TId>,
>({
  focusedId,
  getOptionId = getDefaultCanvasSelectionListOptionId,
  items,
  listId,
  selectedIds,
  selectionMode = 'single',
}: CanvasSelectionListDescriptorInput<TId, TItem>):
  CanvasSelectionListDescriptor<TId, TItem> {
  const normalizedSelectedIds = getCanvasSelectionListNormalizedSelectedIds({
    items,
    selectedIds,
    selectionMode,
  })
  const selectedIdSet = new Set(normalizedSelectedIds)
  const focusableIndex = getCanvasSelectionListFocusableIndex({
    focusedId,
    items,
    selectedIds: normalizedSelectedIds,
  })
  const options = items.map((item, index) => {
    const optionId = item.optionId ?? getOptionId(item.id, index)
    const isDisabled = item.disabled === true
    const isFocusable = index === focusableIndex
    const isSelected = selectedIdSet.has(item.id)

    return {
      ...item,
      attributes: getCanvasSelectionListOptionAttributes({
        disabled: isDisabled,
        focusable: isFocusable,
        optionId,
        selected: isSelected,
      }),
      id: item.id,
      index,
      isDisabled,
      isFocusable,
      isSelected,
      optionId,
    }
  })
  const focusableOption = focusableIndex >= 0 ? options[focusableIndex] : null

  return {
    focusedId: focusableOption?.id ?? null,
    focusModel: CANVAS_SELECTION_LIST_FOCUS_MODEL,
    focusableOptionId: focusableOption?.optionId ?? null,
    keyboardModel: CANVAS_SELECTION_LIST_KEYBOARD_MODEL,
    model: CANVAS_SELECTION_LIST_MODEL,
    options,
    rootAttributes: getCanvasSelectionListRootAttributes({
      listId,
      selectionMode,
    }),
    selectedIds: normalizedSelectedIds,
    selectedOptionIds: options
      .filter((option) => option.isSelected)
      .map((option) => option.optionId),
    selectionMode,
  }
}

export function getCanvasSelectionListRootAttributes({
  listId,
  selectionMode = 'single',
}: {
  listId?: string
  selectionMode?: CanvasSelectionListDescriptorSelectionMode
}): CanvasSelectionListRootAttributes {
  return {
    'aria-multiselectable': selectionMode === 'multiple' ? true : undefined,
    id: listId,
    role: 'listbox',
  }
}

export function getCanvasSelectionListOptionAttributes({
  disabled,
  focusable,
  optionId,
  selected,
}: {
  disabled: boolean
  focusable: boolean
  optionId: string
  selected: boolean
}): CanvasSelectionListOptionAttributes {
  return {
    'aria-disabled': disabled ? true : undefined,
    'aria-selected': selected,
    id: optionId,
    role: 'option',
    tabIndex: getCanvasSelectionListOptionTabIndex({ disabled, focusable }),
  }
}

export function getCanvasSelectionListOptionTabIndex({
  disabled,
  focusable,
}: {
  disabled: boolean
  focusable: boolean
}) {
  if (disabled) {
    return undefined
  }

  return focusable ? 0 : -1
}

function getCanvasSelectionListNormalizedSelectedIds<
  TId extends string,
  TItem extends CanvasSelectionListItemInput<TId>,
>({
  items,
  selectedIds,
  selectionMode,
}: {
  items: readonly TItem[]
  selectedIds: readonly TId[]
  selectionMode: CanvasSelectionListDescriptorSelectionMode
}) {
  const selectedIdSet = new Set(selectedIds)
  const orderedSelectedIds = items
    .filter((item) => selectedIdSet.has(item.id))
    .map((item) => item.id)

  return selectionMode === 'single'
    ? orderedSelectedIds.slice(0, 1)
    : orderedSelectedIds
}

function getCanvasSelectionListFocusableIndex<
  TId extends string,
  TItem extends CanvasSelectionListItemInput<TId>,
>({
  focusedId,
  items,
  selectedIds,
}: {
  focusedId?: TId | null
  items: readonly TItem[]
  selectedIds: readonly TId[]
}) {
  const focusedIndex = focusedId
    ? items.findIndex((item) => item.id === focusedId && item.disabled !== true)
    : -1

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  const selectedIdSet = new Set(selectedIds)
  const selectedIndex = items.findIndex((item) =>
    selectedIdSet.has(item.id) && item.disabled !== true
  )

  if (selectedIndex >= 0) {
    return selectedIndex
  }

  return items.findIndex((item) => item.disabled !== true)
}

function getDefaultCanvasSelectionListOptionId(_id: string, index: number) {
  return `canvas-selection-list-option-${index}`
}

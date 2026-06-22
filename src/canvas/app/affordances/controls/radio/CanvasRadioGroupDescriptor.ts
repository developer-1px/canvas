import type {
  CanvasRadioGroupDescriptor,
  CanvasRadioGroupDescriptorInput,
  CanvasRadioGroupItemInput,
  CanvasRadioGroupRootAttributes,
  CanvasRadioGroupRootAttributesInput,
  CanvasRadioItemAttributes,
  CanvasRadioItemAttributesInput,
} from './CanvasRadioGroupContracts'
import {
  CANVAS_RADIO_GROUP_FOCUS_MODEL,
  CANVAS_RADIO_GROUP_KEYBOARD_MODEL,
  CANVAS_RADIO_GROUP_MODEL,
} from './CanvasRadioGroupContracts'

export function createCanvasRadioGroupDescriptor<
  TId extends string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
>({
  ariaLabel,
  checkedId = null,
  focusedId,
  getRadioId,
  groupId,
  items,
}: CanvasRadioGroupDescriptorInput<TId, TItem>):
  CanvasRadioGroupDescriptor<TId, TItem> {
  const checkedIndex = checkedId
    ? items.findIndex((item) => item.id === checkedId)
    : -1
  const focusableIndex = getCanvasRadioGroupFocusableIndex({
    checkedId,
    focusedId,
    items,
  })
  const descriptors = items.map((item, index) => {
    const isChecked = index === checkedIndex
    const isDisabled = item.disabled === true
    const isFocusable = index === focusableIndex
    const radioId = item.radioId
      ?? getRadioId?.(item.id, index)
      ?? getDefaultCanvasRadioId({ groupId, index })

    return {
      ...item,
      attributes: getCanvasRadioItemAttributes({
        checked: isChecked,
        disabled: isDisabled,
        focusable: isFocusable,
        radioId,
      }),
      id: item.id,
      index,
      isChecked,
      isDisabled,
      isFocusable,
      radioId,
    }
  })
  const checkedItem = checkedIndex >= 0 ? descriptors[checkedIndex] : null
  const focusableItem = focusableIndex >= 0 ? descriptors[focusableIndex] : null

  return {
    checkedId: checkedItem?.id ?? null,
    checkedRadioId: checkedItem?.radioId ?? null,
    focusModel: CANVAS_RADIO_GROUP_FOCUS_MODEL,
    focusableId: focusableItem?.id ?? null,
    focusableRadioId: focusableItem?.radioId ?? null,
    keyboardModel: CANVAS_RADIO_GROUP_KEYBOARD_MODEL,
    model: CANVAS_RADIO_GROUP_MODEL,
    items: descriptors,
    rootAttributes: getCanvasRadioGroupRootAttributes({
      ariaLabel,
      groupId,
    }),
  }
}

export function getCanvasRadioGroupRootAttributes({
  ariaLabel,
  groupId,
}: CanvasRadioGroupRootAttributesInput): CanvasRadioGroupRootAttributes {
  return {
    'aria-label': ariaLabel,
    id: groupId,
    role: 'radiogroup',
  }
}

export function getCanvasRadioItemAttributes({
  checked,
  disabled,
  focusable,
  radioId,
}: CanvasRadioItemAttributesInput): CanvasRadioItemAttributes {
  return {
    'aria-checked': checked,
    'aria-disabled': disabled ? true : undefined,
    id: radioId,
    role: 'radio',
    tabIndex: getCanvasRadioItemTabIndex({ disabled, focusable }),
  }
}

export function getCanvasRadioTabIndex({
  checked,
  disabled,
}: {
  checked: boolean
  disabled: boolean
}): -1 | 0 | undefined {
  if (disabled) {
    return undefined
  }

  return checked ? 0 : -1
}

export function getCanvasRadioItemTabIndex({
  disabled,
  focusable,
}: {
  disabled: boolean
  focusable: boolean
}): -1 | 0 | undefined {
  if (disabled) {
    return undefined
  }

  return focusable ? 0 : -1
}

function getCanvasRadioGroupFocusableIndex<
  TId extends string,
  TItem extends CanvasRadioGroupItemInput<TId>,
>({
  checkedId,
  focusedId,
  items,
}: {
  checkedId?: TId | null
  focusedId?: TId | null
  items: readonly TItem[]
}) {
  const focusedIndex = focusedId
    ? items.findIndex((item) => item.id === focusedId && item.disabled !== true)
    : -1

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  const checkedIndex = checkedId
    ? items.findIndex((item) => item.id === checkedId && item.disabled !== true)
    : -1

  if (checkedIndex >= 0) {
    return checkedIndex
  }

  return items.findIndex((item) => item.disabled !== true)
}

function getDefaultCanvasRadioId({
  groupId,
  index,
}: {
  groupId?: string
  index: number
}) {
  return groupId ? `${groupId}-radio-${index}` : `canvas-radio-${index}`
}

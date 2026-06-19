import type { KeyboardEvent } from 'react'

export const CANVAS_RADIO_GROUP_MODEL = 'canvas-radio-group'
export const CANVAS_RADIO_GROUP_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_RADIO_GROUP_KEYBOARD_MODEL = 'arrow-home-end'

type CanvasRadioItem = HTMLElement & {
  disabled?: boolean
}

export type CanvasRadioGroupItemInput<TId extends string = string> = {
  disabled?: boolean
  id: TId
  radioId?: string
}

export type CanvasRadioGroupRootAttributes = {
  'aria-label': string
  id: string | undefined
  role: 'radiogroup'
}

export type CanvasRadioItemAttributes = {
  'aria-checked': boolean
  'aria-disabled': true | undefined
  id: string
  role: 'radio'
  tabIndex: -1 | 0 | undefined
}

export type CanvasRadioGroupItemDescriptor<
  TId extends string = string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
> =
  TItem & {
    attributes: CanvasRadioItemAttributes
    id: TId
    index: number
    isChecked: boolean
    isDisabled: boolean
    isFocusable: boolean
    radioId: string
  }

export type CanvasRadioGroupDescriptor<
  TId extends string = string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
> = {
  checkedId: TId | null
  checkedRadioId: string | null
  focusModel: typeof CANVAS_RADIO_GROUP_FOCUS_MODEL
  focusableId: TId | null
  focusableRadioId: string | null
  keyboardModel: typeof CANVAS_RADIO_GROUP_KEYBOARD_MODEL
  model: typeof CANVAS_RADIO_GROUP_MODEL
  items: CanvasRadioGroupItemDescriptor<TId, TItem>[]
  rootAttributes: CanvasRadioGroupRootAttributes
}

export type CanvasRadioGroupDescriptorInput<
  TId extends string = string,
  TItem extends CanvasRadioGroupItemInput<TId> =
    CanvasRadioGroupItemInput<TId>,
> = {
  ariaLabel: string
  checkedId?: TId | null
  focusedId?: TId | null
  getRadioId?: (id: TId, index: number) => string
  groupId?: string
  items: readonly TItem[]
}

export type CanvasRadioGroupRootAttributesInput = {
  ariaLabel: string
  groupId?: string
}

export type CanvasRadioItemAttributesInput = {
  checked: boolean
  disabled: boolean
  focusable: boolean
  radioId: string
}

export type CanvasRadioGroupKeyboardIntentInput = {
  count: number
  currentIndex: number
  key: string
}

export type CanvasRadioGroupKeyboardIntent =
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }
  | {
      kind: 'move-radio'
      nextIndex: number
      preventDefault: true
      stopPropagation: true
    }

export type CanvasRadioGroupKeyboardEvent = {
  currentTarget: HTMLElement
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasRadioGroupKeyboardIntentInput = {
  event: CanvasRadioGroupKeyboardEvent
}

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

export function handleCanvasRadioGroupKeyDown(
  event: KeyboardEvent<HTMLElement>,
) {
  runCanvasRadioGroupKeyboardIntent({ event })
}

export function runCanvasRadioGroupKeyboardIntent({
  event,
}: RunCanvasRadioGroupKeyboardIntentInput) {
  const items = getCanvasRadioItems(event.currentTarget)
    .filter(isCanvasRadioItemEnabled)
  const currentIndex = items.findIndex((item) =>
    item === event.currentTarget.ownerDocument.activeElement)
  const intent = getCanvasRadioGroupKeyboardIntent({
    count: items.length,
    currentIndex,
    key: event.key,
  })

  if (intent.kind !== 'move-radio') {
    return false
  }

  const nextItem = items[intent.nextIndex]

  if (!nextItem) {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }
  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  nextItem.focus()
  nextItem.click()
  return true
}

export function getCanvasRadioGroupKeyboardIntent({
  count,
  currentIndex,
  key,
}: CanvasRadioGroupKeyboardIntentInput): CanvasRadioGroupKeyboardIntent {
  const nextIndex = getCanvasRadioKeyIndex({
    count,
    currentIndex,
    key,
  })

  if (nextIndex === null) {
    return {
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    }
  }

  return {
    kind: 'move-radio',
    nextIndex,
    preventDefault: true,
    stopPropagation: true,
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

function getCanvasRadioItems(root: HTMLElement) {
  return Array.from(root.querySelectorAll<CanvasRadioItem>('[role="radio"]'))
}

function isCanvasRadioItemEnabled(item: CanvasRadioItem) {
  return !item.disabled && item.getAttribute('aria-disabled') !== 'true'
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

function getCanvasRadioKeyIndex({
  count,
  currentIndex,
  key,
}: {
  count: number
  currentIndex: number
  key: string
}) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (currentIndex + 1) % count
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return (currentIndex - 1 + count) % count
  }

  if (key === 'Home') {
    return 0
  }

  if (key === 'End') {
    return count - 1
  }

  return null
}

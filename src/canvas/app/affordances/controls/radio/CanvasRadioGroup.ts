import type { KeyboardEvent } from 'react'

export const CANVAS_RADIO_GROUP_MODEL = 'canvas-radio-group'
export const CANVAS_RADIO_GROUP_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_RADIO_GROUP_KEYBOARD_MODEL = 'arrow-home-end'

type CanvasRadioItem = HTMLElement & {
  disabled?: boolean
}

export function handleCanvasRadioGroupKeyDown(
  event: KeyboardEvent<HTMLElement>,
) {
  const items = getCanvasRadioItems(event.currentTarget)
    .filter(isCanvasRadioItemEnabled)
  const currentIndex = items.findIndex((item) =>
    item === event.currentTarget.ownerDocument.activeElement)
  const nextIndex = getCanvasRadioKeyIndex({
    count: items.length,
    currentIndex,
    key: event.key,
  })

  if (nextIndex === null) {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  items[nextIndex]?.focus()
  items[nextIndex]?.click()
}

export function getCanvasRadioTabIndex({
  checked,
  disabled,
}: {
  checked: boolean
  disabled: boolean
}) {
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

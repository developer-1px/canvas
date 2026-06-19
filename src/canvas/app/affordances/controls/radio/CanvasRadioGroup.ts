import type { KeyboardEvent } from 'react'

export const CANVAS_RADIO_GROUP_MODEL = 'canvas-radio-group'
export const CANVAS_RADIO_GROUP_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_RADIO_GROUP_KEYBOARD_MODEL = 'arrow-home-end'

type CanvasRadioItem = HTMLElement & {
  disabled?: boolean
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

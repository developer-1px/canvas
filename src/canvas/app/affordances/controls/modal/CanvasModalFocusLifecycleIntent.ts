import {
  getCanvasModalFocusableElements,
  getCanvasModalNextFocusIndex,
} from './CanvasModalFocusLifecycleFocus'
import type {
  CanvasModalBackdropPointerIntent,
  CanvasModalBackdropPointerIntentInput,
  CanvasModalKeyboardIntent,
  CanvasModalKeyboardIntentInput,
  CanvasModalTabFocusEvent,
  RunCanvasModalBackdropPointerIntentInput,
  RunCanvasModalKeyboardIntentInput,
} from './CanvasModalFocusLifecycleContracts'

export function getCanvasModalBackdropPointerIntent({
  currentTarget,
  target,
}: CanvasModalBackdropPointerIntentInput): CanvasModalBackdropPointerIntent {
  if (currentTarget && target === currentTarget) {
    return {
      kind: 'dismiss',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
    stopPropagation: false,
  }
}

export function getCanvasModalKeyboardIntent({
  key,
}: CanvasModalKeyboardIntentInput): CanvasModalKeyboardIntent {
  if (key === 'Escape') {
    return {
      kind: 'close',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'Tab') {
    return {
      kind: 'trap-focus',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
    stopPropagation: false,
  }
}

export function runCanvasModalBackdropPointerIntent({
  event,
  onDismiss,
}: RunCanvasModalBackdropPointerIntentInput) {
  const backdropPointerIntent = getCanvasModalBackdropPointerIntent({
    currentTarget: event.currentTarget,
    target: event.target,
  })

  if (backdropPointerIntent.kind !== 'dismiss') {
    return false
  }

  if (backdropPointerIntent.preventDefault) {
    event.preventDefault()
  }
  if (backdropPointerIntent.stopPropagation) {
    event.stopPropagation()
  }

  onDismiss()
  return true
}

export function runCanvasModalKeyboardIntent({
  event,
  onClose,
  root,
}: RunCanvasModalKeyboardIntentInput) {
  const modalKeyboardIntent = getCanvasModalKeyboardIntent({ key: event.key })

  if (modalKeyboardIntent.kind === 'close') {
    if (modalKeyboardIntent.preventDefault) {
      event.preventDefault()
    }
    if (modalKeyboardIntent.stopPropagation) {
      event.stopPropagation()
    }
    onClose()
    return true
  }

  if (modalKeyboardIntent.kind === 'trap-focus') {
    return trapCanvasModalTabFocus({
      event,
      root,
    })
  }

  return false
}

export function trapCanvasModalTabFocus({
  event,
  root,
}: {
  event: CanvasModalTabFocusEvent
  root: HTMLElement | null
}) {
  if (event.key !== 'Tab' || !root) {
    return false
  }

  const focusableElements = getCanvasModalFocusableElements(root)

  event.preventDefault()
  event.stopPropagation()

  const nextIndex = getCanvasModalNextFocusIndex({
    count: focusableElements.length,
    currentIndex: focusableElements.findIndex((element) =>
      element === root.ownerDocument.activeElement),
    shiftKey: !!event.shiftKey,
  })

  if (nextIndex === null) {
    return true
  }

  focusableElements[nextIndex]?.focus()
  return true
}

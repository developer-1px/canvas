import type {
  CanvasMenuRovingActiveIndexInput,
  CanvasMenuRovingKeyIndexInput,
  CanvasMenuRovingKeyboardIntent,
  CanvasMenuRovingKeyboardIntentInput,
  CanvasMenuTriggerKeyboardIntent,
  CanvasMenuTriggerKeyboardIntentInput,
  RunCanvasMenuRovingKeyboardIntentInput,
} from './CanvasMenuRovingFocusContracts'

export function getCanvasMenuRovingActiveIndex({
  count,
  focusedIndex,
  preferredIndex,
}: CanvasMenuRovingActiveIndexInput) {
  if (count === 0) {
    return 0
  }

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  return Math.max(0, Math.min(preferredIndex, count - 1))
}

export function getCanvasMenuRovingKeyIndex({
  count,
  currentIndex,
  key,
}: CanvasMenuRovingKeyIndexInput) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return (currentIndex + 1) % count
  }

  if (key === 'ArrowUp' || key === 'ArrowLeft') {
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

export function getCanvasMenuRovingKeyboardIntent({
  count,
  currentIndex,
  key,
}: CanvasMenuRovingKeyboardIntentInput): CanvasMenuRovingKeyboardIntent {
  const nextIndex = getCanvasMenuRovingKeyIndex({
    count,
    currentIndex,
    key,
  })

  if (nextIndex !== null) {
    return {
      kind: 'move-focus',
      nextIndex,
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'Escape') {
    return {
      kind: 'close-menu',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'Enter' || key === ' ') {
    return {
      kind: 'activate-item',
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

export function runCanvasMenuRovingKeyboardIntent({
  count,
  currentIndex,
  event,
  onActivateItem,
  onClose,
  onMoveFocus,
}: RunCanvasMenuRovingKeyboardIntentInput) {
  const intent = getCanvasMenuRovingKeyboardIntent({
    count,
    currentIndex,
    key: event.key,
  })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }

  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  if (intent.kind === 'move-focus') {
    onMoveFocus(intent.nextIndex)
    return true
  }

  if (intent.kind === 'close-menu') {
    onClose()
    return true
  }

  if (currentIndex >= 0) {
    onActivateItem(currentIndex)
  }
  return true
}

export function getCanvasMenuTriggerKeyboardIntent({
  key,
}: CanvasMenuTriggerKeyboardIntentInput): CanvasMenuTriggerKeyboardIntent {
  if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
    return {
      kind: 'open-menu',
      preventDefault: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
  }
}

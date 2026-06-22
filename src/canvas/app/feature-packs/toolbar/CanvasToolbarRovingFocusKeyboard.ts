import type {
  CanvasToolbarOrientation,
  CanvasToolbarRovingActiveIndexInput,
  CanvasToolbarRovingKeyIndexInput,
  CanvasToolbarRovingKeyboardIntent,
  CanvasToolbarRovingKeyboardIntentInput,
  RunCanvasToolbarRovingKeyboardIntentInput,
} from './CanvasToolbarRovingFocusContracts'

export function getCanvasToolbarRovingActiveIndex({
  count,
  focusedIndex,
  preferredIndex,
}: CanvasToolbarRovingActiveIndexInput) {
  if (count === 0) {
    return 0
  }

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  return Math.max(0, Math.min(preferredIndex, count - 1))
}

export function getCanvasToolbarRovingKeyIndex({
  count,
  currentIndex,
  key,
  orientation = 'both',
}: CanvasToolbarRovingKeyIndexInput) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (isCanvasToolbarForwardKey({ key, orientation })) {
    return (currentIndex + 1) % count
  }

  if (isCanvasToolbarBackwardKey({ key, orientation })) {
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

export function getCanvasToolbarRovingKeyboardIntent({
  count,
  currentIndex,
  key,
  orientation,
}: CanvasToolbarRovingKeyboardIntentInput): CanvasToolbarRovingKeyboardIntent {
  const nextIndex = getCanvasToolbarRovingKeyIndex({
    count,
    currentIndex,
    key,
    orientation,
  })

  if (nextIndex === null) {
    return {
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    }
  }

  return {
    kind: 'move-focus',
    nextIndex,
    preventDefault: true,
    stopPropagation: true,
  }
}

export function runCanvasToolbarRovingKeyboardIntent({
  count,
  currentIndex,
  event,
  onMoveFocus,
  orientation,
}: RunCanvasToolbarRovingKeyboardIntentInput) {
  const intent = getCanvasToolbarRovingKeyboardIntent({
    count,
    currentIndex,
    key: event.key,
    orientation,
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

  onMoveFocus(intent.nextIndex)
  return true
}

function isCanvasToolbarForwardKey({
  key,
  orientation,
}: {
  key: string
  orientation: CanvasToolbarOrientation
}) {
  if (orientation === 'horizontal') {
    return key === 'ArrowRight'
  }

  if (orientation === 'vertical') {
    return key === 'ArrowDown'
  }

  return key === 'ArrowRight' || key === 'ArrowDown'
}

function isCanvasToolbarBackwardKey({
  key,
  orientation,
}: {
  key: string
  orientation: CanvasToolbarOrientation
}) {
  if (orientation === 'horizontal') {
    return key === 'ArrowLeft'
  }

  if (orientation === 'vertical') {
    return key === 'ArrowUp'
  }

  return key === 'ArrowLeft' || key === 'ArrowUp'
}

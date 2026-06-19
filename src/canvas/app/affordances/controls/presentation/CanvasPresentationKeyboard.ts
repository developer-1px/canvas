export type CanvasPresentationKeyboardIntentInput = {
  key: string
}

export type CanvasPresentationKeyboardIntent =
  | {
      kind: 'exit'
      preventDefault: true
      stopPropagation: true
    }
  | {
      direction: -1 | 1
      kind: 'navigate'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type CanvasPresentationKeyboardEvent = {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasPresentationKeyboardIntentInput = {
  event: CanvasPresentationKeyboardEvent
  onExit: () => void
  onNavigate: (direction: -1 | 1) => void
}

export function getCanvasPresentationKeyboardIntent({
  key,
}: CanvasPresentationKeyboardIntentInput): CanvasPresentationKeyboardIntent {
  if (key === 'Escape') {
    return {
      kind: 'exit',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'ArrowRight' || key === 'PageDown' || key === ' ') {
    return {
      direction: 1,
      kind: 'navigate',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'ArrowLeft' || key === 'PageUp') {
    return {
      direction: -1,
      kind: 'navigate',
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

export function runCanvasPresentationKeyboardIntent({
  event,
  onExit,
  onNavigate,
}: RunCanvasPresentationKeyboardIntentInput) {
  const intent = getCanvasPresentationKeyboardIntent({ key: event.key })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }
  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  if (intent.kind === 'exit') {
    onExit()
    return true
  }

  onNavigate(intent.direction)
  return true
}

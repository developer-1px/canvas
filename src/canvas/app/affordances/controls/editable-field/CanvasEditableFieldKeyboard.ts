export type CanvasEditableFieldKeyboardIntentInput = {
  key: string
}

export type CanvasEditableFieldKeyboardIntent =
  | {
      kind: 'commit'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'cancel'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type CanvasEditableFieldKeyboardEvent = {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasEditableFieldKeyboardIntentInput = {
  event: CanvasEditableFieldKeyboardEvent
  onCancel: () => void
  onCommit: () => void
}

export function getCanvasEditableFieldKeyboardIntent({
  key,
}: CanvasEditableFieldKeyboardIntentInput): CanvasEditableFieldKeyboardIntent {
  if (key === 'Enter') {
    return {
      kind: 'commit',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'Escape') {
    return {
      kind: 'cancel',
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

export function runCanvasEditableFieldKeyboardIntent({
  event,
  onCancel,
  onCommit,
}: RunCanvasEditableFieldKeyboardIntentInput) {
  const intent = getCanvasEditableFieldKeyboardIntent({ key: event.key })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }
  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  if (intent.kind === 'commit') {
    onCommit()
    return true
  }

  onCancel()
  return true
}

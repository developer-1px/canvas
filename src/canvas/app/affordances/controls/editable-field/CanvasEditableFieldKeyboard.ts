export type CanvasEditableFieldKeyboardIntentInput = {
  key: string
}

export type CanvasEditableFieldKeyboardIntent =
  | {
    kind: 'commit'
    preventDefault: true
  }
  | {
    kind: 'cancel'
    preventDefault: true
  }
  | {
    kind: 'none'
    preventDefault: false
  }

export function getCanvasEditableFieldKeyboardIntent({
  key,
}: CanvasEditableFieldKeyboardIntentInput): CanvasEditableFieldKeyboardIntent {
  if (key === 'Enter') {
    return {
      kind: 'commit',
      preventDefault: true,
    }
  }

  if (key === 'Escape') {
    return {
      kind: 'cancel',
      preventDefault: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
  }
}

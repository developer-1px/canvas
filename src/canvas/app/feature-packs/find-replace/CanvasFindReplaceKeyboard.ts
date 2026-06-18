export type CanvasFindInputKeyboardIntentInput = {
  key: string
  shiftKey?: boolean
}

export type CanvasFindInputKeyboardIntent =
  | {
      direction: -1 | 1
      kind: 'find-match'
      preventDefault: true
    }
  | {
      kind: 'close-find'
      preventDefault: true
    }
  | {
      kind: 'none'
      preventDefault: false
    }

export function getCanvasFindInputKeyboardIntent({
  key,
  shiftKey = false,
}: CanvasFindInputKeyboardIntentInput): CanvasFindInputKeyboardIntent {
  if (key === 'Enter') {
    return {
      direction: shiftKey ? -1 : 1,
      kind: 'find-match',
      preventDefault: true,
    }
  }

  if (key === 'Escape') {
    return {
      kind: 'close-find',
      preventDefault: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
  }
}

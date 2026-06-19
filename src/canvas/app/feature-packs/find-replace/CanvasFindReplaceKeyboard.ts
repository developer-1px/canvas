export type CanvasFindInputKeyboardIntentInput = {
  key: string
  shiftKey?: boolean
}

export type CanvasFindInputKeyboardIntent =
  | {
      direction: -1 | 1
      kind: 'find-match'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'close-find'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
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
      stopPropagation: true,
    }
  }

  if (key === 'Escape') {
    return {
      kind: 'close-find',
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

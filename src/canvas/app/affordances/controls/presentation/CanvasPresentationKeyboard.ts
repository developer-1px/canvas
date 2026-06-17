export type CanvasPresentationKeyboardIntentInput = {
  key: string
}

export type CanvasPresentationKeyboardIntent =
  | {
      kind: 'exit'
      preventDefault: true
    }
  | {
      direction: -1 | 1
      kind: 'navigate'
      preventDefault: true
    }
  | {
      kind: 'none'
      preventDefault: false
    }

export function getCanvasPresentationKeyboardIntent({
  key,
}: CanvasPresentationKeyboardIntentInput): CanvasPresentationKeyboardIntent {
  if (key === 'Escape') {
    return {
      kind: 'exit',
      preventDefault: true,
    }
  }

  if (key === 'ArrowRight' || key === 'PageDown' || key === ' ') {
    return {
      direction: 1,
      kind: 'navigate',
      preventDefault: true,
    }
  }

  if (key === 'ArrowLeft' || key === 'PageUp') {
    return {
      direction: -1,
      kind: 'navigate',
      preventDefault: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
  }
}

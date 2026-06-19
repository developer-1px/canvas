export const CANVAS_KEYBOARD_TEXT_FONT_SIZE_MODEL =
  'canvas-keyboard-text-font-size-shortcuts'
export const CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL =
  'canvas-keyboard-text-font-size-intent'
export const CANVAS_KEYBOARD_TEXT_FONT_SIZE_KEYS =
  'Cmd/Ctrl+Shift+< Cmd/Ctrl+Shift+>'
export const CANVAS_KEYBOARD_TEXT_FONT_SIZE_STEP = 2

export type CanvasKeyboardTextFontSizeDirection =
  | 'decrease'
  | 'increase'

export type CanvasKeyboardTextFontSizeKeyboardEvent = {
  altKey: boolean
  code: string
  ctrlKey: boolean
  key: string
  metaKey: boolean
  shiftKey: boolean
}

export type CanvasKeyboardTextFontSizeIntent =
  | {
      kind: 'none'
      preventDefault: false
    }
  | {
      delta: number
      direction: CanvasKeyboardTextFontSizeDirection
      intent: typeof CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL
      kind: 'step-text-font-size'
      preventDefault: true
    }

export type CanvasKeyboardTextFontSizeShortcutIntentInput = {
  event: CanvasKeyboardTextFontSizeKeyboardEvent
  step?: number
}

export function getCanvasKeyboardTextFontSizeShortcutIntent({
  event,
  step = CANVAS_KEYBOARD_TEXT_FONT_SIZE_STEP,
}: CanvasKeyboardTextFontSizeShortcutIntentInput):
  CanvasKeyboardTextFontSizeIntent {
  if (
    !(event.metaKey || event.ctrlKey) ||
    !event.shiftKey ||
    event.altKey
  ) {
    return getCanvasKeyboardTextFontSizeNoneIntent()
  }

  if (event.key === '>' || event.code === 'Period') {
    return {
      delta: step,
      direction: 'increase',
      intent: CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL,
      kind: 'step-text-font-size',
      preventDefault: true,
    }
  }

  if (event.key === '<' || event.code === 'Comma') {
    return {
      delta: -step,
      direction: 'decrease',
      intent: CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL,
      kind: 'step-text-font-size',
      preventDefault: true,
    }
  }

  return getCanvasKeyboardTextFontSizeNoneIntent()
}

function getCanvasKeyboardTextFontSizeNoneIntent():
  CanvasKeyboardTextFontSizeIntent {
  return {
    kind: 'none',
    preventDefault: false,
  }
}

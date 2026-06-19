import { describe, expect, it } from 'vitest'
import {
  CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL,
  CANVAS_KEYBOARD_TEXT_FONT_SIZE_KEYS,
  CANVAS_KEYBOARD_TEXT_FONT_SIZE_MODEL,
  CANVAS_KEYBOARD_TEXT_FONT_SIZE_STEP,
  getCanvasKeyboardTextFontSizeShortcutIntent,
} from './CanvasKeyboardTextFontSizeShortcuts'

describe('CanvasKeyboardTextFontSizeShortcuts', () => {
  it('exports text font size shortcut metadata for host DOM contracts', () => {
    expect(CANVAS_KEYBOARD_TEXT_FONT_SIZE_MODEL).toBe(
      'canvas-keyboard-text-font-size-shortcuts',
    )
    expect(CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL).toBe(
      'canvas-keyboard-text-font-size-intent',
    )
    expect(CANVAS_KEYBOARD_TEXT_FONT_SIZE_KEYS).toBe(
      'Cmd/Ctrl+Shift+< Cmd/Ctrl+Shift+>',
    )
    expect(CANVAS_KEYBOARD_TEXT_FONT_SIZE_STEP).toBe(2)
  })

  it('maps Cmd/Ctrl Shift > to a font size increase intent', () => {
    expect(getCanvasKeyboardTextFontSizeShortcutIntent({
      event: createKeyboardEvent({
        code: 'Period',
        key: '>',
        metaKey: true,
        shiftKey: true,
      }),
    })).toEqual({
      delta: 2,
      direction: 'increase',
      intent: CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL,
      kind: 'step-text-font-size',
      preventDefault: true,
    })
  })

  it('maps Cmd/Ctrl Shift < to a font size decrease intent', () => {
    expect(getCanvasKeyboardTextFontSizeShortcutIntent({
      event: createKeyboardEvent({
        code: 'Comma',
        ctrlKey: true,
        key: '<',
        shiftKey: true,
      }),
    })).toEqual({
      delta: -2,
      direction: 'decrease',
      intent: CANVAS_KEYBOARD_TEXT_FONT_SIZE_INTENT_MODEL,
      kind: 'step-text-font-size',
      preventDefault: true,
    })
  })

  it('does not route Alt, unmodified, unshifted, or unrelated keys', () => {
    for (const event of [
      createKeyboardEvent({
        altKey: true,
        code: 'Period',
        key: '>',
        metaKey: true,
        shiftKey: true,
      }),
      createKeyboardEvent({
        code: 'Period',
        key: '>',
        shiftKey: true,
      }),
      createKeyboardEvent({
        code: 'Period',
        key: '.',
        metaKey: true,
      }),
      createKeyboardEvent({
        code: 'KeyB',
        key: 'b',
        metaKey: true,
        shiftKey: true,
      }),
    ]) {
      expect(getCanvasKeyboardTextFontSizeShortcutIntent({ event })).toEqual({
        kind: 'none',
        preventDefault: false,
      })
    }
  })

  it('uses a host-provided step when supplied', () => {
    expect(getCanvasKeyboardTextFontSizeShortcutIntent({
      event: createKeyboardEvent({
        code: 'Period',
        ctrlKey: true,
        key: '>',
        shiftKey: true,
      }),
      step: 4,
    })).toMatchObject({
      delta: 4,
      direction: 'increase',
    })
  })
})

function createKeyboardEvent(
  overrides: Partial<
    Parameters<typeof getCanvasKeyboardTextFontSizeShortcutIntent>[0]['event']
  > = {},
): Parameters<typeof getCanvasKeyboardTextFontSizeShortcutIntent>[0]['event'] {
  return {
    altKey: false,
    code: 'KeyA',
    ctrlKey: false,
    key: 'a',
    metaKey: false,
    shiftKey: false,
    ...overrides,
  }
}

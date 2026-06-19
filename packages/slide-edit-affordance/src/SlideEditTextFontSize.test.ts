import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFontSizeDescriptor,
  getSlideEditTextFontSizeCommandEffect,
  getSlideEditTextFontSizeCSSValue,
  getSlideEditTextFontSizeJSONPasteValue,
  getSlideEditTextFontSizeJSONPasteValueFromText,
  getSlideEditTextFontSizeJSONPasteValueFromValue,
  getSlideEditTextFontSizeKeyboardIntent,
  normalizeSlideEditTextFontSize,
  SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
  SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_KEYS,
  SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS,
} from './SlideEditTextFontSize'
import {
  getSlideEditTextFontSizeKeyboardIntent as getSlideEditTextFontSizeKeyboardIntentFromPackage,
  getSlideEditTextFontSizeJSONPasteValueFromText as getSlideEditTextFontSizeJSONPasteValueFromTextFromPackage,
  getSlideEditTextFontSizeJSONPasteValueFromValue as getSlideEditTextFontSizeJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditTextFontSize', () => {
  it('creates font size descriptors with metadata and import keys', () => {
    expect(createSlideEditTextFontSizeDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: '18.256',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
      metadata: {
        attribute: 'data-slide-text-font-size',
        defaultValue: 16,
        value: 18.26,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-font-size',
      value: 18.26,
    })
    expect(SLIDE_EDIT_TEXT_FONT_SIZE_FIELD).toMatchObject({
      commandId: 'update-text-font-size',
      control: 'font-size-stepper',
      id: 'fontSize',
      jsonKeys: ['textFontSize', 'fontSize', 'size', 'value'],
      jsonMimeType:
        'application/vnd.interactive-os.slide-edit.text-font-size+json',
      step: 0.5,
    })
  })

  it('maps font size increase and decrease keyboard shortcuts', () => {
    expect(SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_KEYS).toBe(
      'Cmd/Ctrl+Shift+> Cmd/Ctrl+Shift+<',
    )
    expect(getSlideEditTextFontSizeKeyboardIntent({
      code: 'Period',
      key: '>',
      mod: true,
      shiftKey: true,
    })).toEqual({
      commandId: 'update-text-font-size',
      delta: 0.5,
      direction: 'increase',
      fieldId: 'fontSize',
      intent: 'slide-edit-text-font-size-keyboard-intent',
      keyboardModel: 'slide-edit-text-font-size-keyboard-shortcuts',
      kind: 'increase-text-font-size',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+Shift+>',
      step: 0.5,
    })
    expect(getSlideEditTextFontSizeKeyboardIntent({
      code: 'Comma',
      key: '<',
      mod: true,
      shiftKey: true,
    })).toMatchObject({
      delta: -0.5,
      direction: 'decrease',
      shortcut: 'Cmd/Ctrl+Shift+<',
    })
  })

  it('ignores non-text font size keyboard chords', () => {
    expect(getSlideEditTextFontSizeKeyboardIntent({
      key: '>',
      mod: true,
      shiftKey: false,
    })).toBeNull()
    expect(getSlideEditTextFontSizeKeyboardIntent({
      altKey: true,
      key: '>',
      mod: true,
      shiftKey: true,
    })).toBeNull()
    expect(getSlideEditTextFontSizeKeyboardIntent({
      key: 'x',
      mod: true,
      shiftKey: true,
    })).toBeNull()
  })

  it('routes font size updates through host command effects and JSON paste', () => {
    expect(getSlideEditTextFontSizeCommandEffect({
      fieldId: 'fontSize',
      id: 'update-text-font-size',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 999,
    }).payload.value).toBe(400)
    expect(getSlideEditTextFontSizeJSONPasteValueFromValue(
      { textFontSize: '24' },
      { mode: 'wrapped' },
    )).toBe(24)
    expect(normalizeSlideEditTextFontSize(Number.NaN)).toBe(16)
    expect(getSlideEditTextFontSizeKeyboardIntentFromPackage({
      code: 'Period',
      key: '>',
      mod: true,
      shiftKey: true,
    })?.kind).toBe('increase-text-font-size')
  })

  it('reads custom MIME direct font size JSON values first', () => {
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FONT_SIZE_FIELD.jsonMimeType]: '24.126',
        'text/json': '{"fontSize":18}',
        'text/plain': '{"fontSize":18}',
      }),
    })).toBe(24.13)
  })

  it('reads explicit font size fields from general JSON payloads', () => {
    for (const [payload, expected] of [
      [{ textFontSize: 18 }, 18],
      [{ fontSize: '24.126' }, 24.13],
      [{ size: 0 }, 1],
      [{ value: 999 }, 400],
    ] as const) {
      expect(getSlideEditTextFontSizeJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
      })).toBe(expected)
    }
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"fontSize":32}',
      }),
    })).toBe(32)
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"fontSize":42}',
      }),
    })).toBe(42)
  })

  it('reads font size JSON from text and parsed values', () => {
    expect(getSlideEditTextFontSizeJSONPasteValueFromText('24.126'))
      .toBe(24.13)
    expect(getSlideEditTextFontSizeJSONPasteValueFromValue({
      fontSize: 999,
    }, { mode: 'wrapped' })).toBe(400)
    expect(getSlideEditTextFontSizeJSONPasteValueFromTextFromPackage(
      '{"textFontSize":0}',
      { mode: 'wrapped' },
    )).toBe(1)
    expect(getSlideEditTextFontSizeJSONPasteValueFromValueFromPackage(
      '18.126',
    )).toBe(18.13)
    expect(getSlideEditTextFontSizeJSONPasteValueFromText(
      '"18"',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('does not treat unrelated JSON or direct text/plain values as font size', () => {
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '18',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"18"',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fontSize":"large"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":18}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': 'not json',
      }),
    })).toBeNull()
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextFontSizeDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 24,
      }),
      field: SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
      limits: SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS,
    }).toLowerCase()

    for (const blockedTerm of [
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
    ]) {
      expect(publicStrings).not.toContain(blockedTerm)
    }
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphAlignDescriptor,
  getSlideEditTextParagraphAlignCommandEffect,
  getSlideEditTextParagraphAlignCSSValue,
  getSlideEditTextParagraphAlignJSONPasteValue,
  getSlideEditTextParagraphAlignJSONPasteValueFromText,
  getSlideEditTextParagraphAlignJSONPasteValueFromValue,
  getSlideEditTextParagraphAlignKeyboardIntent,
  normalizeSlideEditTextParagraphAlign,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_DEFAULT,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_INTENT,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_MODEL,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_ROUTING_PRIORITY,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS,
} from './SlideEditTextParagraphAlign'
import {
  createSlideEditTextParagraphAlignDescriptor as createSlideEditTextParagraphAlignDescriptorFromPackage,
  getSlideEditTextParagraphAlignJSONPasteValueFromText as getSlideEditTextParagraphAlignJSONPasteValueFromTextFromPackage,
  getSlideEditTextParagraphAlignJSONPasteValueFromValue as getSlideEditTextParagraphAlignJSONPasteValueFromValueFromPackage,
  getSlideEditTextParagraphAlignKeyboardIntent as getSlideEditTextParagraphAlignKeyboardIntentFromPackage,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS as SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS_FROM_PACKAGE,
} from './index'

describe('SlideEditTextParagraphAlign', () => {
  it('creates a product-neutral paragraph align descriptor', () => {
    expect(createSlideEditTextParagraphAlignDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-align',
      value: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_DEFAULT,
    })
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD).toMatchObject({
      commandId: 'update-text-paragraph-align',
      control: 'paragraph-align-segmented-control',
      id: 'paragraphAlign',
      requiredAdapterSlot: 'command-effect',
    })
    expect(createSlideEditTextParagraphAlignDescriptorFromPackage({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'center',
    })).toMatchObject({
      surface: 'text-paragraph-align',
      value: 'center',
    })
  })

  it('documents paragraph align options metadata', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS).toEqual([
      {
        cssTextAlign: 'left',
        id: 'left',
        label: 'Left',
      },
      {
        cssTextAlign: 'center',
        id: 'center',
        label: 'Center',
      },
      {
        cssTextAlign: 'right',
        id: 'right',
        label: 'Right',
      },
    ])
  })

  it('normalizes unknown values to the left fallback', () => {
    expect(normalizeSlideEditTextParagraphAlign('left')).toBe('left')
    expect(normalizeSlideEditTextParagraphAlign('center')).toBe('center')
    expect(normalizeSlideEditTextParagraphAlign('right')).toBe('right')
    expect(normalizeSlideEditTextParagraphAlign('justify')).toBe('left')
    expect(normalizeSlideEditTextParagraphAlign(null)).toBe('left')
  })

  it('maps normalized paragraph align values to CSS text-align values', () => {
    expect(getSlideEditTextParagraphAlignCSSValue('left')).toBe('left')
    expect(getSlideEditTextParagraphAlignCSSValue('center')).toBe('center')
    expect(getSlideEditTextParagraphAlignCSSValue('right')).toBe('right')
    expect(getSlideEditTextParagraphAlignCSSValue('justify')).toBe('left')
  })

  it('routes selected text object paragraph align updates through host command effects', () => {
    expect(getSlideEditTextParagraphAlignCommandEffect({
      fieldId: 'paragraphAlign',
      id: 'update-text-paragraph-align',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'right',
    })).toEqual({
      payload: {
        fieldId: 'paragraphAlign',
        id: 'update-text-paragraph-align',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'right',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('maps paragraph align keyboard shortcuts to align intents', () => {
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: true,
    })).toEqual({
      align: 'left',
      commandId: 'update-text-paragraph-align',
      intent: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_INTENT,
      kind: 'set-text-paragraph-align',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+L',
    })
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'E',
      mod: true,
    })).toMatchObject({
      align: 'center',
      shortcut: 'Cmd/Ctrl+E',
    })
    expect(getSlideEditTextParagraphAlignKeyboardIntentFromPackage({
      key: 'r',
      mod: true,
    })).toMatchObject({
      align: 'right',
      shortcut: 'Cmd/Ctrl+R',
    })
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'j',
      mod: true,
    })).toMatchObject({
      align: 'justify',
      shortcut: 'Cmd/Ctrl+J',
    })
  })

  it('does not route shifted, alternate, or unrelated keys', () => {
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: true,
      shiftKey: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      altKey: true,
      key: 'l',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'x',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: false,
    })).toBeNull()
  })

  it('exports paragraph align keyboard metadata and routing priority', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_MODEL).toBe(
      'slide-edit-text-paragraph-align-keyboard-shortcuts',
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_INTENT).toBe(
      'slide-edit-text-paragraph-align-keyboard-intent',
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS).toBe(
      'Cmd/Ctrl+L Cmd/Ctrl+E Cmd/Ctrl+R Cmd/Ctrl+J',
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS_FROM_PACKAGE).toBe(
      SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS,
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_ROUTING_PRIORITY).toBe(
      'text-selection-before-host-command',
    )
  })

  it('reads custom MIME direct paragraph align JSON values first', () => {
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD.jsonMimeType]: '"right"',
        'text/json': '{"paragraphAlign":"center"}',
        'text/plain': '{"paragraphAlign":"left"}',
      }),
    })).toBe('right')
  })

  it('reads explicit paragraph align fields from general JSON payloads', () => {
    for (const [payload, expected] of [
      [{ textParagraphAlign: 'left' }, 'left'],
      [{ paragraphAlign: 'center' }, 'center'],
      [{ textAlign: 'right' }, 'right'],
      [{ align: 'center' }, 'center'],
      [{ value: 'right' }, 'right'],
    ] as const) {
      expect(getSlideEditTextParagraphAlignJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
      })).toBe(expected)
    }
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"paragraphAlign":"center"}',
      }),
    })).toBe('center')
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"paragraphAlign":"center"}',
      }),
    })).toBe('center')
  })

  it('reads paragraph align JSON from text and parsed values', () => {
    expect(getSlideEditTextParagraphAlignJSONPasteValueFromText('"right"'))
      .toBe('right')
    expect(getSlideEditTextParagraphAlignJSONPasteValueFromValue({
      align: 'center',
    }, { mode: 'wrapped' })).toBe('center')
    expect(getSlideEditTextParagraphAlignJSONPasteValueFromTextFromPackage(
      '{"value":"left"}',
      { mode: 'wrapped' },
    )).toBe('left')
    expect(getSlideEditTextParagraphAlignJSONPasteValueFromValueFromPackage(
      'center',
    )).toBe('center')
    expect(getSlideEditTextParagraphAlignJSONPasteValueFromText(
      '"center"',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('does not treat unrelated JSON or direct text/plain values as paragraph align', () => {
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"center"',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'center',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"align":"middle"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":"left"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': 'not json',
      }),
    })).toBeNull()
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextParagraphAlignDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'right',
      }),
      field: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
      options: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS,
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

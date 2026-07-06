import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphAlignDescriptor,
  getSlideEditTextParagraphAlignCommandEffect,
  getSlideEditTextParagraphAlignJSONPasteValue,
  getSlideEditTextParagraphAlignJSONPasteValueFromText,
  getSlideEditTextParagraphAlignJSONPasteValueFromValue,
  getSlideEditTextParagraphAlignKeyboardIntent,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS,
} from './SlideEditTextParagraphAlign'
import {
  getSlideEditTextParagraphAlignJSONPasteValueFromText as getSlideEditTextParagraphAlignJSONPasteValueFromTextFromPackage,
  getSlideEditTextParagraphAlignJSONPasteValueFromValue as getSlideEditTextParagraphAlignJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditTextParagraphAlign', () => {
  it('creates paragraph alignment descriptors', () => {
    expect(createSlideEditTextParagraphAlignDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'center',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-align',
      value: 'center',
    })
  })

  it('maps Cmd/Ctrl+L, E, and R to paragraph alignment intents', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS).toBe(
      'Cmd/Ctrl+L Cmd/Ctrl+E Cmd/Ctrl+R',
    )
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: true,
    })).toMatchObject({
      align: 'left',
      kind: 'set-text-paragraph-align',
      shortcut: 'Cmd/Ctrl+L',
    })
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'e',
      mod: true,
    })?.align).toBe('center')
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'r',
      mod: true,
    })?.align).toBe('right')
  })

  it('does not consume alternate paragraph alignment chords', () => {
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      altKey: true,
      key: 'l',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: true,
      shiftKey: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'j',
      mod: true,
    })).toBeNull()
  })

  it('routes paragraph alignment updates and JSON paste through host commands', () => {
    expect(getSlideEditTextParagraphAlignCommandEffect({
      fieldId: 'paragraphAlign',
      id: 'update-text-paragraph-align',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'right',
    })).toMatchObject({
      payload: {
        value: 'right',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
    })
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
    getData(type: string) {
      return values[type] ?? ''
    },
  }
}

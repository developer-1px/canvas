import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextRunFormattingDescriptor,
  getSlideEditTextRunColorCommandEffect,
  getSlideEditTextRunColorJSONPasteValue,
  getSlideEditTextRunColorJSONPasteValueFromText,
  getSlideEditTextRunColorJSONPasteValueFromValue,
  getSlideEditTextRunFormattingCommandEffect,
  getSlideEditTextRunFormattingJSONPasteValue,
  getSlideEditTextRunFormattingJSONPasteValueFromText,
  getSlideEditTextRunFormattingJSONPasteValueFromValue,
  getSlideEditTextRunSizeCommandEffect,
  getSlideEditTextRunSizeJSONPasteValue,
  getSlideEditTextRunSizeJSONPasteValueFromText,
  getSlideEditTextRunSizeJSONPasteValueFromValue,
  getSlideEditTextFormattingKeyboardIntent,
  normalizeSlideEditTextRunColorValue,
  normalizeSlideEditTextRunFormattingValue,
  normalizeSlideEditTextRunSizeValue,
  SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS,
} from './SlideEditTextFormattingKeyboard'
import {
  createSlideEditTextRunFormattingDescriptor as createSlideEditTextRunFormattingDescriptorFromPackage,
  getSlideEditTextRunColorJSONPasteValue as getSlideEditTextRunColorJSONPasteValueFromPackage,
  getSlideEditTextRunColorJSONPasteValueFromText as getSlideEditTextRunColorJSONPasteValueFromTextFromPackage,
  getSlideEditTextRunFormattingJSONPasteValueFromText as getSlideEditTextRunFormattingJSONPasteValueFromTextFromPackage,
  getSlideEditTextRunSizeJSONPasteValue as getSlideEditTextRunSizeJSONPasteValueFromPackage,
  getSlideEditTextRunSizeJSONPasteValueFromValue as getSlideEditTextRunSizeJSONPasteValueFromValueFromPackage,
  getSlideEditTextFormattingKeyboardIntent as getSlideEditTextFormattingKeyboardIntentFromPackage,
} from './index'

describe('SlideEditTextFormattingKeyboard', () => {
  it('maps Cmd/Ctrl+B, I, and U to text formatting intents', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'b',
      mod: true,
    })).toEqual({
      commandId: 'toggle-bold',
      kind: 'toggle-bold',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+B',
    })

    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'I',
      mod: true,
    })).toEqual({
      commandId: 'toggle-italic',
      kind: 'toggle-italic',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+I',
    })

    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'u',
      mod: true,
    })).toEqual({
      commandId: 'toggle-underline',
      kind: 'toggle-underline',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+U',
    })
  })

  it('returns null without the primary modifier', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'b',
      mod: false,
    })).toBeNull()
  })

  it('returns null for alternate modifier chords', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      altKey: true,
      key: 'b',
      mod: true,
    })).toBeNull()

    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'b',
      mod: true,
      shiftKey: true,
    })).toBeNull()
  })

  it('returns null for unsupported keys', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'x',
      mod: true,
    })).toBeNull()
  })

  it('is available from the package index', () => {
    expect(getSlideEditTextFormattingKeyboardIntentFromPackage({
      key: 'b',
      mod: true,
    })).toMatchObject({
      kind: 'toggle-bold',
      shortcut: 'Cmd/Ctrl+B',
    })
    expect(createSlideEditTextRunFormattingDescriptorFromPackage({
      objectIds: ['object-a'],
      slideId: 'slide-a',
    })).toMatchObject({
      surface: 'text-run-formatting',
    })
    expect(getSlideEditTextRunSizeJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[3].jsonMimeType]: '18',
      }),
    })).toBe(18)
    expect(getSlideEditTextRunColorJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[4].jsonMimeType]: '"#ABC"',
      }),
    })).toBe('#aabbcc')
    expect(getSlideEditTextRunFormattingJSONPasteValueFromTextFromPackage(
      '{"underline":true}',
      {
        fieldId: 'underline',
        mode: 'wrapped',
      },
    )).toBe(true)
    expect(getSlideEditTextRunFormattingJSONPasteValueFromTextFromPackage(
      '{"strikeThrough":true}',
      {
        fieldId: 'strikethrough',
        mode: 'wrapped',
      },
    )).toBe(true)
    expect(getSlideEditTextRunSizeJSONPasteValueFromValueFromPackage(
      { runSize: '19.25' },
      { mode: 'wrapped' },
    )).toBe(19.25)
    expect(getSlideEditTextRunColorJSONPasteValueFromTextFromPackage(
      '"#ABC"',
    )).toBe('#aabbcc')
  })

  it('creates product-neutral text run formatting descriptors', () => {
    expect(createSlideEditTextRunFormattingDescriptor({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS,
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
      surface: 'text-run-formatting',
    })
    expect(SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.map((field) => field.id))
      .toEqual([
        'bold',
        'italic',
        'underline',
        'size',
        'color',
        'strikethrough',
      ])
  })

  it('normalizes boolean run formatting values and rejects invalid values', () => {
    expect(normalizeSlideEditTextRunFormattingValue(true)).toBe(true)
    expect(normalizeSlideEditTextRunFormattingValue(false)).toBe(false)
    expect(normalizeSlideEditTextRunFormattingValue('true')).toBeNull()
    expect(normalizeSlideEditTextRunFormattingValue(1)).toBeNull()
    expect(normalizeSlideEditTextRunFormattingValue(null)).toBeNull()
  })

  it('normalizes run size and color values independently from text object style', () => {
    expect(normalizeSlideEditTextRunSizeValue('18.456')).toBe(18.46)
    expect(normalizeSlideEditTextRunSizeValue(0)).toBe(1)
    expect(normalizeSlideEditTextRunSizeValue(999)).toBe(400)
    expect(normalizeSlideEditTextRunSizeValue('large')).toBeNull()

    expect(normalizeSlideEditTextRunColorValue(' #ABC ')).toBe('#aabbcc')
    expect(normalizeSlideEditTextRunColorValue('ABCDEF')).toBe('#abcdef')
    expect(normalizeSlideEditTextRunColorValue('currentColor'))
      .toBe('currentColor')
    expect(normalizeSlideEditTextRunColorValue('')).toBeNull()
  })

  it('routes run formatting commands through host command effects', () => {
    expect(getSlideEditTextRunFormattingCommandEffect({
      fieldId: 'italic',
      id: 'update-text-run-formatting',
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
      value: true,
    })).toEqual({
      payload: {
        fieldId: 'italic',
        id: 'update-text-run-formatting',
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
        value: true,
      },
      selection: {
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditTextRunFormattingCommandEffect({
      fieldId: 'strikethrough',
      id: 'update-text-run-formatting',
      objectIds: ['object-a'],
      slideId: 'slide-a',
      value: true,
    })).toEqual({
      payload: {
        fieldId: 'strikethrough',
        id: 'update-text-run-formatting',
        objectIds: ['object-a'],
        slideId: 'slide-a',
        value: true,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('routes run size and color commands through host command effects', () => {
    expect(getSlideEditTextRunSizeCommandEffect({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
      value: 999,
    })).toEqual({
      payload: {
        fieldId: 'size',
        id: 'update-text-run-formatting',
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
        value: 400,
      },
      selection: {
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditTextRunColorCommandEffect({
      objectIds: ['object-a'],
      slideId: 'slide-a',
      value: '#ABC',
    })).toEqual({
      payload: {
        fieldId: 'color',
        id: 'update-text-run-formatting',
        objectIds: ['object-a'],
        slideId: 'slide-a',
        value: '#aabbcc',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('reads custom MIME direct JSON boolean values', () => {
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[1].jsonMimeType]: 'true',
        'text/plain': 'ignored',
      }),
      fieldId: 'italic',
    })).toBe(true)
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[0].jsonMimeType]: 'false',
      }),
      fieldId: 'bold',
    })).toBe(false)
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [getFormattingField('strikethrough').jsonMimeType]: 'true',
      }),
      fieldId: 'strikethrough',
    })).toBe(true)
  })

  it('reads custom MIME direct JSON run size and color values', () => {
    expect(getSlideEditTextRunSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[3].jsonMimeType]: '999',
      }),
    })).toBe(400)
    expect(getSlideEditTextRunSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[3].jsonMimeType]: '"18.456"',
      }),
    })).toBe(18.46)
    expect(getSlideEditTextRunColorJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[4].jsonMimeType]: '"#ABC"',
      }),
    })).toBe('#aabbcc')
  })

  it('reads explicit run formatting fields from general JSON payloads', () => {
    for (const [fieldId, payload, expected] of [
      ['bold', { textRunBold: true }, true],
      ['bold', { runBold: false }, false],
      ['italic', { italic: true }, true],
      ['italic', { value: false }, false],
      ['underline', { textRunUnderline: true }, true],
      ['underline', { runUnderline: false }, false],
      ['strikethrough', { textRunStrikethrough: true }, true],
      ['strikethrough', { runStrikethrough: false }, false],
      ['strikethrough', { strikeThrough: true }, true],
      ['strikethrough', { strike: false }, false],
    ] as const) {
      expect(getSlideEditTextRunFormattingJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
        fieldId,
      })).toBe(expected)
    }
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"runItalic":true}',
      }),
      fieldId: 'italic',
    })).toBe(true)
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"runItalic":true}',
      }),
      fieldId: 'italic',
    })).toBe(true)
  })

  it('reads explicit run size and color fields from fallback MIME payloads', () => {
    expect(getSlideEditTextRunSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"textRunSize":"22.234"}',
      }),
    })).toBe(22.23)
    expect(getSlideEditTextRunSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"runSize":0}',
      }),
    })).toBe(1)
    expect(getSlideEditTextRunColorJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"textRunColor":"ABCDEF"}',
      }),
    })).toBe('#abcdef')
    expect(getSlideEditTextRunColorJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"color":"currentColor"}',
      }),
    })).toBe('currentColor')
  })

  it('reads run formatting JSON from text and parsed values', () => {
    expect(getSlideEditTextRunFormattingJSONPasteValueFromText(
      'true',
      { fieldId: 'bold' },
    )).toBe(true)
    expect(getSlideEditTextRunFormattingJSONPasteValueFromValue(
      { runItalic: true },
      {
        fieldId: 'italic',
        mode: 'wrapped',
      },
    )).toBe(true)
    expect(getSlideEditTextRunFormattingJSONPasteValueFromValue(
      { runStrikeThrough: true },
      {
        fieldId: 'strikethrough',
        mode: 'wrapped',
      },
    )).toBe(true)
    expect(getSlideEditTextRunSizeJSONPasteValueFromText('"18.456"'))
      .toBe(18.46)
    expect(getSlideEditTextRunSizeJSONPasteValueFromValue(
      { textRunSize: 0 },
      { mode: 'wrapped' },
    )).toBe(1)
    expect(getSlideEditTextRunColorJSONPasteValueFromText('"ABCDEF"'))
      .toBe('#abcdef')
    expect(getSlideEditTextRunColorJSONPasteValueFromValue(
      { textRunColor: 'currentColor' },
      { mode: 'wrapped' },
    )).toBe('currentColor')
    expect(getSlideEditTextRunColorJSONPasteValueFromText(
      '"#ABC"',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('does not treat generic text/plain direct values as run formatting', () => {
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'true',
      }),
      fieldId: 'italic',
    })).toBeNull()
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"italic":"true"}',
      }),
      fieldId: 'italic',
    })).toBeNull()
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS[1].jsonMimeType]: '"true"',
      }),
      fieldId: 'italic',
    })).toBeNull()
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"bold":true}',
      }),
      fieldId: 'italic',
    })).toBeNull()
    expect(getSlideEditTextRunFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'not json',
      }),
      fieldId: 'bold',
    })).toBeNull()
    expect(getSlideEditTextRunSizeJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '18',
      }),
    })).toBeNull()
    expect(getSlideEditTextRunColorJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"#ABC"',
      }),
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

function getFormattingField(fieldId: string) {
  const field = SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.find(
    (candidate) => candidate.id === fieldId,
  )

  if (!field) {
    throw new Error(`Missing formatting field: ${fieldId}`)
  }

  return field
}

import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextRunFormattingDescriptor,
  getSlideEditTextRunFormattingCommandEffect,
  getSlideEditTextRunFormattingJSONPasteValue,
  getSlideEditTextFormattingKeyboardIntent,
  normalizeSlideEditTextRunFormattingValue,
  SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS,
} from './SlideEditTextFormattingKeyboard'
import {
  createSlideEditTextRunFormattingDescriptor as createSlideEditTextRunFormattingDescriptorFromPackage,
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
      .toEqual(['bold', 'italic', 'underline'])
  })

  it('normalizes boolean run formatting values and rejects invalid values', () => {
    expect(normalizeSlideEditTextRunFormattingValue(true)).toBe(true)
    expect(normalizeSlideEditTextRunFormattingValue(false)).toBe(false)
    expect(normalizeSlideEditTextRunFormattingValue('true')).toBeNull()
    expect(normalizeSlideEditTextRunFormattingValue(1)).toBeNull()
    expect(normalizeSlideEditTextRunFormattingValue(null)).toBeNull()
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
  })

  it('reads explicit run formatting fields from general JSON payloads', () => {
    for (const [fieldId, payload, expected] of [
      ['bold', { textRunBold: true }, true],
      ['bold', { runBold: false }, false],
      ['italic', { italic: true }, true],
      ['italic', { value: false }, false],
      ['underline', { textRunUnderline: true }, true],
      ['underline', { runUnderline: false }, false],
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
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

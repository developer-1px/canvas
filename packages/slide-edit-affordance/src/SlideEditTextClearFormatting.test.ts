import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextClearFormattingDescriptor,
  getSlideEditTextClearFormattingCommandEffect,
  getSlideEditTextClearFormattingJSONPasteValue,
  getSlideEditTextClearFormattingJSONPasteValueFromText,
  getSlideEditTextClearFormattingJSONPasteValueFromValue,
  normalizeSlideEditTextClearFormattingValue,
  SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE,
} from './SlideEditTextClearFormatting'
import {
  createSlideEditTextClearFormattingDescriptor as createSlideEditTextClearFormattingDescriptorFromPackage,
  getSlideEditTextClearFormattingJSONPasteValue as getSlideEditTextClearFormattingJSONPasteValueFromPackage,
  getSlideEditTextClearFormattingJSONPasteValueFromText as getSlideEditTextClearFormattingJSONPasteValueFromTextFromPackage,
} from './index'

describe('SlideEditTextClearFormatting', () => {
  it('creates product-neutral text clear formatting descriptors', () => {
    expect(createSlideEditTextClearFormattingDescriptor({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
    })).toEqual({
      commandId: 'clear-text-formatting',
      control: 'button',
      jsonKeys: [
        'textClearFormatting',
        'clearTextFormatting',
        'clearFormatting',
        'clearFormat',
        'resetFormatting',
        'value',
      ],
      jsonMimeType: SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE,
      objectIds: ['object-a', 'object-b'],
      requiredAdapterSlot: 'command-effect',
      slideId: 'slide-a',
      surface: 'text-clear-formatting',
    })
  })

  it('is available from the package index', () => {
    expect(createSlideEditTextClearFormattingDescriptorFromPackage({
      objectIds: ['object-a'],
      slideId: 'slide-a',
    })).toMatchObject({
      commandId: 'clear-text-formatting',
      surface: 'text-clear-formatting',
    })
    expect(getSlideEditTextClearFormattingJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE]: 'true',
      }),
    })).toBe(true)
    expect(
      getSlideEditTextClearFormattingJSONPasteValueFromTextFromPackage(
        '{"clearFormatting":true}',
        { mode: 'wrapped' },
      ),
    ).toBe(true)
  })

  it('routes clear formatting through a host command effect', () => {
    expect(getSlideEditTextClearFormattingCommandEffect({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'clear-text-formatting',
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
      },
      selection: {
        objectIds: ['object-a', 'object-b'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('normalizes only true as a clear formatting value', () => {
    expect(normalizeSlideEditTextClearFormattingValue(true)).toBe(true)
    expect(normalizeSlideEditTextClearFormattingValue(false)).toBeNull()
    expect(normalizeSlideEditTextClearFormattingValue('true')).toBeNull()
    expect(normalizeSlideEditTextClearFormattingValue(1)).toBeNull()
    expect(normalizeSlideEditTextClearFormattingValue(null)).toBeNull()
  })

  it('reads custom MIME direct JSON values', () => {
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_CLEAR_FORMATTING_JSON_MIME_TYPE]: 'true',
        'text/plain': 'ignored',
      }),
    })).toBe(true)
  })

  it('reads explicit clear formatting fields from fallback MIME payloads', () => {
    for (const payload of [
      { textClearFormatting: true },
      { clearTextFormatting: true },
      { clearFormatting: true },
      { clearFormat: true },
      { resetFormatting: true },
      { value: true },
    ]) {
      expect(getSlideEditTextClearFormattingJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
      })).toBe(true)
    }
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"clearFormatting":true}',
      }),
    })).toBe(true)
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"resetFormatting":true}',
      }),
    })).toBe(true)
  })

  it('reads clear formatting JSON from text and parsed values', () => {
    expect(getSlideEditTextClearFormattingJSONPasteValueFromText('true'))
      .toBe(true)
    expect(getSlideEditTextClearFormattingJSONPasteValueFromValue({
      clearFormatting: true,
    }, {
      mode: 'wrapped',
    })).toBe(true)
    expect(getSlideEditTextClearFormattingJSONPasteValueFromText(
      '{"clearFormatting":true}',
      { mode: 'wrapped' },
    )).toBe(true)
  })

  it('does not treat generic text/plain direct values as clear formatting', () => {
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'true',
      }),
    })).toBeNull()
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"clearFormatting":false}',
      }),
    })).toBeNull()
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"clearFormatting":"true"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'not json',
      }),
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

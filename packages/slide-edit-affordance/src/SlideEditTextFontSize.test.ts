import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFontSizeDescriptor,
  getSlideEditTextFontSizeCommandEffect,
  getSlideEditTextFontSizeCSSValue,
  getSlideEditTextFontSizeJSONPasteValue,
  getSlideEditTextFontSizeJSONPasteValueFromText,
  getSlideEditTextFontSizeJSONPasteValueFromValue,
  getSlideEditTextFontSizeMetadata,
  normalizeSlideEditTextFontSize,
  SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
  SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
  SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS,
  toSlideEditTextFontSizeAttributeValue,
} from './SlideEditTextFontSize'
import {
  createSlideEditTextFontSizeDescriptor as createSlideEditTextFontSizeDescriptorFromPackage,
  getSlideEditTextFontSizeJSONPasteValueFromText as getSlideEditTextFontSizeJSONPasteValueFromTextFromPackage,
  getSlideEditTextFontSizeJSONPasteValueFromValue as getSlideEditTextFontSizeJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditTextFontSize', () => {
  it('creates a product-neutral font size descriptor', () => {
    expect(createSlideEditTextFontSizeDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
      metadata: {
        attribute: SLIDE_EDIT_TEXT_FONT_SIZE_DATA_ATTRIBUTE,
        defaultValue: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
        value: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-font-size',
      value: SLIDE_EDIT_TEXT_FONT_SIZE_DEFAULT,
    })
    expect(createSlideEditTextFontSizeDescriptorFromPackage({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 18,
    })).toMatchObject({
      surface: 'text-font-size',
      value: 18,
    })
  })

  it('documents font size field limits metadata', () => {
    expect(SLIDE_EDIT_TEXT_FONT_SIZE_FIELD).toMatchObject({
      commandId: 'update-text-font-size',
      control: 'font-size-stepper',
      id: 'fontSize',
      max: 400,
      min: 1,
      requiredAdapterSlot: 'command-effect',
      step: 0.5,
      unit: 'px',
    })
    expect(SLIDE_EDIT_TEXT_FONT_SIZE_LIMITS).toEqual({
      defaultValue: 16,
      max: 400,
      min: 1,
      precision: 2,
      step: 0.5,
      unit: 'px',
    })
  })

  it('normalizes font size values with fallback, clamp, and precision', () => {
    expect(normalizeSlideEditTextFontSize(18)).toBe(18)
    expect(normalizeSlideEditTextFontSize('24.126')).toBe(24.13)
    expect(normalizeSlideEditTextFontSize(0)).toBe(1)
    expect(normalizeSlideEditTextFontSize(999)).toBe(400)
    expect(normalizeSlideEditTextFontSize(Number.NaN)).toBe(16)
    expect(normalizeSlideEditTextFontSize('large')).toBe(16)
    expect(normalizeSlideEditTextFontSize(null)).toBe(16)
  })

  it('provides CSS and attribute metadata helpers', () => {
    expect(getSlideEditTextFontSizeCSSValue('18.126')).toBe('18.13px')
    expect(getSlideEditTextFontSizeCSSValue('large')).toBe('16px')
    expect(getSlideEditTextFontSizeMetadata(20)).toEqual({
      attribute: 'data-slide-text-font-size',
      defaultValue: 16,
      value: 20,
    })
    expect(toSlideEditTextFontSizeAttributeValue('24.126')).toBe('24.13')
  })

  it('routes selected text object font size updates through host command effects', () => {
    expect(getSlideEditTextFontSizeCommandEffect({
      fieldId: 'fontSize',
      id: 'update-text-font-size',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 18.126,
    })).toEqual({
      payload: {
        fieldId: 'fontSize',
        id: 'update-text-font-size',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 18.13,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
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

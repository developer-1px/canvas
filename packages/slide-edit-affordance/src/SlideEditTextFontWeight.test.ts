import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFontWeightDescriptor,
  getSlideEditTextFontWeightCommandEffect,
  getSlideEditTextFontWeightCSSValue,
  getSlideEditTextFontWeightJSONPasteValue,
  normalizeSlideEditTextFontWeight,
  SLIDE_EDIT_TEXT_FONT_WEIGHT_DEFAULT,
  SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD,
  SLIDE_EDIT_TEXT_FONT_WEIGHT_OPTIONS,
} from './SlideEditTextFontWeight'
import {
  createSlideEditTextFontWeightDescriptor as createSlideEditTextFontWeightDescriptorFromPackage,
} from './index'

describe('SlideEditTextFontWeight', () => {
  it('creates a product-neutral font weight descriptor', () => {
    expect(createSlideEditTextFontWeightDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-font-weight',
      value: SLIDE_EDIT_TEXT_FONT_WEIGHT_DEFAULT,
    })
    expect(SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD).toMatchObject({
      commandId: 'update-text-font-weight',
      control: 'font-weight-segmented-control',
      id: 'fontWeight',
      requiredAdapterSlot: 'command-effect',
    })
    expect(createSlideEditTextFontWeightDescriptorFromPackage({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'bold',
    })).toMatchObject({
      surface: 'text-font-weight',
      value: 'bold',
    })
  })

  it('documents font weight options metadata', () => {
    expect(SLIDE_EDIT_TEXT_FONT_WEIGHT_OPTIONS).toEqual([
      {
        cssFontWeight: 400,
        id: 'regular',
        label: 'Regular',
      },
      {
        cssFontWeight: 600,
        id: 'semibold',
        label: 'Semibold',
      },
      {
        cssFontWeight: 700,
        id: 'bold',
        label: 'Bold',
      },
    ])
  })

  it('normalizes symbolic, css, and boolean bold values', () => {
    expect(normalizeSlideEditTextFontWeight('regular')).toBe('regular')
    expect(normalizeSlideEditTextFontWeight('semibold')).toBe('semibold')
    expect(normalizeSlideEditTextFontWeight('bold')).toBe('bold')
    expect(normalizeSlideEditTextFontWeight(400)).toBe('regular')
    expect(normalizeSlideEditTextFontWeight('600')).toBe('semibold')
    expect(normalizeSlideEditTextFontWeight(700)).toBe('bold')
    expect(normalizeSlideEditTextFontWeight(true)).toBe('bold')
    expect(normalizeSlideEditTextFontWeight(false)).toBe('regular')
    expect(normalizeSlideEditTextFontWeight('heavy')).toBe('regular')
    expect(normalizeSlideEditTextFontWeight(null)).toBe('regular')
  })

  it('maps normalized font weight values to CSS font-weight values', () => {
    expect(getSlideEditTextFontWeightCSSValue('regular')).toBe(400)
    expect(getSlideEditTextFontWeightCSSValue('semibold')).toBe(600)
    expect(getSlideEditTextFontWeightCSSValue('bold')).toBe(700)
    expect(getSlideEditTextFontWeightCSSValue('heavy')).toBe(400)
  })

  it('routes selected text object font weight updates through host command effects', () => {
    expect(getSlideEditTextFontWeightCommandEffect({
      fieldId: 'fontWeight',
      id: 'update-text-font-weight',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'semibold',
    })).toEqual({
      payload: {
        fieldId: 'fontWeight',
        id: 'update-text-font-weight',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'semibold',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('reads custom MIME direct font weight JSON values first', () => {
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD.jsonMimeType]: '"bold"',
        'text/plain': '{"fontWeight":"regular"}',
      }),
    })).toBe('bold')
  })

  it('reads explicit font weight fields from general JSON payloads', () => {
    for (const [payload, expected] of [
      [{ textFontWeight: 'regular' }, 'regular'],
      [{ fontWeight: 'semibold' }, 'semibold'],
      [{ weight: 700 }, 'bold'],
      [{ bold: true }, 'bold'],
      [{ bold: false }, 'regular'],
      [{ value: '600' }, 'semibold'],
    ] as const) {
      expect(getSlideEditTextFontWeightJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
      })).toBe(expected)
    }
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"fontWeight":"bold"}',
      }),
    })).toBe('bold')
  })

  it('does not treat unrelated JSON or direct text/plain values as font weight', () => {
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"bold"',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'true',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fontWeight":"heavy"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFontWeightJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":"bold"}',
      }),
    })).toBeNull()
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextFontWeightDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'bold',
      }),
      field: SLIDE_EDIT_TEXT_FONT_WEIGHT_FIELD,
      options: SLIDE_EDIT_TEXT_FONT_WEIGHT_OPTIONS,
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

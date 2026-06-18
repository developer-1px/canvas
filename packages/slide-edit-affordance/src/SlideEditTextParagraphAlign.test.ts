import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphAlignDescriptor,
  getSlideEditTextParagraphAlignCommandEffect,
  getSlideEditTextParagraphAlignCSSValue,
  getSlideEditTextParagraphAlignJSONPasteValue,
  normalizeSlideEditTextParagraphAlign,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_DEFAULT,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_OPTIONS,
} from './SlideEditTextParagraphAlign'
import {
  createSlideEditTextParagraphAlignDescriptor as createSlideEditTextParagraphAlignDescriptorFromPackage,
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

  it('reads custom MIME direct paragraph align JSON values first', () => {
    expect(getSlideEditTextParagraphAlignJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD.jsonMimeType]: '"right"',
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

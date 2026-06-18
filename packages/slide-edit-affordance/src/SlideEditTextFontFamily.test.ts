import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFontFamilyDescriptor,
  getSlideEditTextFontFamilyCSS,
  getSlideEditTextFontFamilyCommandEffect,
  getSlideEditTextFontFamilyJSONPasteValue,
  normalizeSlideEditTextFontFamily,
  normalizeSlideEditTextFontFamilyOptions,
  SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK,
  SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD,
  type SlideEditTextFontFamilyOption,
} from './SlideEditTextFontFamily'
import {
  getSlideEditTextFontFamilyJSONPasteValue as getSlideEditTextFontFamilyJSONPasteValueFromPackage,
} from './index'

describe('SlideEditTextFontFamily', () => {
  const options = [
    {
      cssFontFamily: 'Body Sans, sans-serif',
      family: 'Body Sans',
      isDefault: true,
      label: 'Body Sans',
      source: 'theme',
    },
    {
      cssFontFamily: 'Title Serif, serif',
      family: 'Title Serif',
      label: 'Title Serif',
      source: 'theme',
    },
  ] as const satisfies readonly SlideEditTextFontFamilyOption[]

  it('creates a product-neutral selected text font family descriptor', () => {
    expect(createSlideEditTextFontFamilyDescriptor({
      fontFamily: 'Title Serif',
      objectId: 'object-a',
      options,
      slideId: 'slide-a',
    })).toEqual({
      fallbackFontFamily: 'Body Sans',
      field: SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD,
      fontFamily: 'Title Serif',
      objectId: 'object-a',
      options,
      slideId: 'slide-a',
      surface: 'text-font-family',
    })
  })

  it('normalizes host-provided font family options', () => {
    expect(normalizeSlideEditTextFontFamilyOptions([
      {
        cssFontFamily: '  Body Sans, sans-serif  ',
        family: '  Body Sans  ',
        label: '  Body  ',
        source: 'host',
      },
      {
        family: 'Body Sans',
        label: 'Duplicate',
        source: 'host',
      },
      {
        family: '',
        label: 'Missing',
        source: 'host',
      },
    ])).toEqual([
      {
        cssFontFamily: 'Body Sans, sans-serif',
        family: 'Body Sans',
        label: 'Body',
        source: 'host',
      },
    ])
  })

  it('falls back for unknown or empty font family values', () => {
    expect(normalizeSlideEditTextFontFamily({
      fallbackFontFamily: 'Body Sans',
      fontFamily: 'Unknown',
      options,
    })).toBe('Body Sans')
    expect(normalizeSlideEditTextFontFamily({
      fallbackFontFamily: 'Missing',
      fontFamily: 'Unknown',
      options,
    })).toBe('Body Sans')
    expect(normalizeSlideEditTextFontFamily({
      fontFamily: '  Custom Sans  ',
      options: [],
    })).toBe('Custom Sans')
    expect(normalizeSlideEditTextFontFamily({
      fontFamily: '',
      options: [],
    })).toBe(SLIDE_EDIT_TEXT_FONT_FAMILY_FALLBACK)
  })

  it('formats selected font family values for CSS rendering', () => {
    expect(getSlideEditTextFontFamilyCSS({
      fallbackFontFamily: 'Body Sans',
      fontFamily: 'Title Serif',
      options,
    })).toBe('Title Serif, serif')

    expect(getSlideEditTextFontFamilyCSS({
      fallbackFontFamily: 'Body Sans',
      fontFamily: 'Unknown',
      options,
    })).toBe('Body Sans, sans-serif')

    expect(getSlideEditTextFontFamilyCSS({
      fontFamily: 'Custom Display',
      options: [],
    })).toBe('"Custom Display"')

    expect(getSlideEditTextFontFamilyCSS({
      fontFamily: 'system-ui',
      options: [],
    })).toBe('system-ui')
  })

  it('reads custom MIME direct font family JSON strings first', () => {
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD.jsonMimeType]: '"Title Serif"',
        'text/json': '{"fontFamily":"Body Sans"}',
        'text/plain': '{"fontFamily":"Body Sans"}',
      }),
      fallbackFontFamily: 'Body Sans',
      options,
    })).toBe('Title Serif')
    expect(getSlideEditTextFontFamilyJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD.jsonMimeType]: '"Body Sans"',
      }),
      fallbackFontFamily: 'Body Sans',
      options,
    })).toBe('Body Sans')
  })

  it('reads custom MIME and general JSON font family wrappers', () => {
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD.jsonMimeType]:
          '{"value":"Title Serif"}',
      }),
      fallbackFontFamily: 'Body Sans',
      options,
    })).toBe('Title Serif')

    for (const [payload, expected] of [
      [{ textFontFamily: 'Title Serif' }, 'Title Serif'],
      [{ fontFamily: 'Body Sans' }, 'Body Sans'],
      [{ font: 'Unknown' }, 'Body Sans'],
      [{ family: 'Title Serif' }, 'Title Serif'],
      [{ value: 'Custom Sans' }, 'Custom Sans'],
    ] as const) {
      expect(getSlideEditTextFontFamilyJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
        fallbackFontFamily: 'Body Sans',
        options: expected === 'Custom Sans' ? [] : options,
      })).toBe(expected)
    }

    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"fontFamily":"Title Serif"}',
      }),
      fallbackFontFamily: 'Body Sans',
      options,
    })).toBe('Title Serif')
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"fontFamily":"Inter"}',
      }),
      fallbackFontFamily: 'Body Sans',
      options: [],
    })).toBe('Inter')
  })

  it('does not treat unrelated JSON or direct text/plain values as font family', () => {
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: null,
      options,
    })).toBeNull()
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"Title Serif"',
      }),
      options,
    })).toBeNull()
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'not json',
      }),
      options,
    })).toBeNull()
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":"Title Serif"}',
      }),
      options,
    })).toBeNull()
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fontFamily":18}',
      }),
      options,
    })).toBeNull()
    expect(getSlideEditTextFontFamilyJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"unrelated":"Title Serif"}',
      }),
      options,
    })).toBeNull()
  })

  it('routes selected text object font family changes through host command effects', () => {
    expect(getSlideEditTextFontFamilyCommandEffect({
      fieldId: 'fontFamily',
      id: 'update-text-font-family',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'Title Serif',
    }, {
      fallbackFontFamily: 'Body Sans',
      options,
    })).toEqual({
      payload: {
        fieldId: 'fontFamily',
        id: 'update-text-font-family',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'Title Serif',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditTextFontFamilyCommandEffect({
      fieldId: 'fontFamily',
      id: 'update-text-font-family',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'Unknown',
    }, {
      fallbackFontFamily: 'Body Sans',
      options,
    }).payload.value).toBe('Body Sans')
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextFontFamilyDescriptor({
        fontFamily: 'Body Sans',
        objectId: 'object-a',
        options,
        slideId: 'slide-a',
      }),
      field: SLIDE_EDIT_TEXT_FONT_FAMILY_FIELD,
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

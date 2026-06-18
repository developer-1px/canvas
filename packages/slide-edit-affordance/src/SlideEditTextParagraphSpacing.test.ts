import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphSpacingDescriptor,
  getSlideEditTextParagraphSpacingCommandEffect,
  getSlideEditTextParagraphSpacingCSSStyle,
  normalizeSlideEditTextLineHeightRatio,
  normalizeSlideEditTextParagraphSpacingAmount,
  normalizeSlideEditTextParagraphSpacingNumber,
  SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS,
} from './SlideEditTextParagraphSpacing'

describe('SlideEditTextParagraphSpacing', () => {
  it('creates a product-neutral text paragraph spacing descriptor', () => {
    expect(createSlideEditTextParagraphSpacingDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-spacing',
      values: SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING,
    })
  })

  it('provides line height and paragraph before/after field descriptors', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS.map((field) =>
      field.id
    )).toEqual([
      'lineHeightRatio',
      'paragraphBefore',
      'paragraphAfter',
    ])
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS.map((field) =>
      field.commandId
    )).toEqual([
      'update-text-paragraph-spacing',
      'update-text-paragraph-spacing',
      'update-text-paragraph-spacing',
    ])
  })

  it('routes field updates through host command effects', () => {
    expect(getSlideEditTextParagraphSpacingCommandEffect({
      fieldId: 'lineHeightRatio',
      id: 'update-text-paragraph-spacing',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 1.25,
    })).toEqual({
      payload: {
        fieldId: 'lineHeightRatio',
        id: 'update-text-paragraph-spacing',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 1.25,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditTextParagraphSpacingCommandEffect({
      fieldId: 'paragraphBefore',
      id: 'update-text-paragraph-spacing',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: {
        unit: 'slide-unit',
        value: -10,
      },
    }).payload.value).toEqual({
      unit: 'slide-unit',
      value: 0,
    })
  })

  it('normalizes numeric boundaries before host application', () => {
    expect(normalizeSlideEditTextLineHeightRatio(Number.NaN)).toBe(1)
    expect(normalizeSlideEditTextLineHeightRatio(0.1)).toBe(
      SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minLineHeightRatio,
    )
    expect(normalizeSlideEditTextLineHeightRatio(4.5)).toBe(
      SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxLineHeightRatio,
    )
    expect(normalizeSlideEditTextLineHeightRatio(1.234)).toBe(1.23)

    expect(normalizeSlideEditTextParagraphSpacingAmount({
      unit: 'slide-unit',
      value: 12.345,
    })).toEqual({
      unit: 'slide-unit',
      value: 12.35,
    })
    expect(normalizeSlideEditTextParagraphSpacingAmount({
      unit: 'px',
      value: Number.POSITIVE_INFINITY,
    })).toEqual({
      unit: 'px',
      value: 0,
    })
    expect(normalizeSlideEditTextParagraphSpacingNumber({
      fallback: 2,
      max: 10,
      min: 0,
      precision: 1,
      value: 10.49,
    })).toBe(10)
  })

  it('formats normalized paragraph spacing values for CSS rendering', () => {
    expect(getSlideEditTextParagraphSpacingCSSStyle({
      lineHeightRatio: 1.234,
      paragraphAfter: {
        unit: 'px',
        value: 8.126,
      },
      paragraphBefore: {
        unit: 'slide-unit',
        value: 4.234,
      },
    })).toEqual({
      lineHeight: 1.23,
      marginBottom: '8.13px',
      marginTop: '4.23px',
    })

    expect(getSlideEditTextParagraphSpacingCSSStyle(null)).toEqual({
      lineHeight: 1,
      marginBottom: '0px',
      marginTop: '0px',
    })
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextParagraphSpacingDescriptor({
        lineHeightRatio: 1.2,
        objectId: 'object-a',
        paragraphAfter: {
          unit: 'px',
          value: 8,
        },
        paragraphBefore: {
          unit: 'slide-unit',
          value: 4,
        },
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
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

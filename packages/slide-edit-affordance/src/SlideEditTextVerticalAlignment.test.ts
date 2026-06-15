import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextVerticalAlignmentDescriptor,
  getSlideEditTextVerticalAlignmentCommandEffect,
  getSlideEditTextVerticalAlignmentMetadata,
  normalizeSlideEditTextVerticalAlignment,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
} from './SlideEditTextVerticalAlignment'

describe('SlideEditTextVerticalAlignment', () => {
  it('creates a text vertical alignment descriptor with top as default', () => {
    expect(createSlideEditTextVerticalAlignmentDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
      metadata: {
        attribute: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
        defaultValue: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
        value: 'top',
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-vertical-alignment',
      value: 'top',
    })
  })

  it('documents the allowed alignment values and metadata attribute', () => {
    expect(SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS.map((option) =>
      option.id
    )).toEqual([
      'top',
      'middle',
      'bottom',
    ])
    expect(getSlideEditTextVerticalAlignmentMetadata('middle')).toEqual({
      attribute: 'data-slide-text-vertical-align',
      defaultValue: 'top',
      value: 'middle',
    })
  })

  it('normalizes unknown values to top', () => {
    expect(normalizeSlideEditTextVerticalAlignment('bottom')).toBe('bottom')
    expect(normalizeSlideEditTextVerticalAlignment('center')).toBe('top')
    expect(normalizeSlideEditTextVerticalAlignment(null)).toBe('top')
  })

  it('routes selected text object alignment updates through host command effects', () => {
    expect(getSlideEditTextVerticalAlignmentCommandEffect({
      fieldId: 'verticalAlignment',
      id: 'update-text-vertical-alignment',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'middle',
    })).toEqual({
      payload: {
        fieldId: 'verticalAlignment',
        id: 'update-text-vertical-alignment',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'middle',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextVerticalAlignmentDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'bottom',
      }),
      field: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
      options: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
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

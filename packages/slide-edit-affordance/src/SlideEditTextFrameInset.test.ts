import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFrameInsetDescriptor,
  getSlideEditTextFrameInsetPaddingCSS,
  getSlideEditTextFrameInsetCommandEffect,
  getSlideEditTextFrameInsetMetadata,
  normalizeSlideEditTextFrameInset,
  normalizeSlideEditTextFrameInsetValue,
  SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
  SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
  SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS,
  toSlideEditTextFrameInsetAttributeValue,
} from './SlideEditTextFrameInset'

describe('SlideEditTextFrameInset', () => {
  it('creates a text frame inset descriptor with zero defaults', () => {
    expect(createSlideEditTextFrameInsetDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
      inset: SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
      metadata: {
        attribute: SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE,
        defaultValue: '0 0 0 0',
        inset: SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
        value: '0 0 0 0',
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-frame-inset',
    })
  })

  it('documents the four inset fields and metadata attribute value order', () => {
    expect(SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS.map((field) => field.id))
      .toEqual([
        'top',
        'right',
        'bottom',
        'left',
      ])
    expect(toSlideEditTextFrameInsetAttributeValue({
      bottom: 3,
      left: 4,
      right: 2,
      top: 1,
    })).toBe('1 2 3 4')
    expect(getSlideEditTextFrameInsetMetadata({
      bottom: 3,
      left: 4,
      right: 2,
      top: 1,
    }).attribute).toBe('data-slide-text-frame-inset')
  })

  it('formats normalized inset as CSS padding in metadata order', () => {
    expect(getSlideEditTextFrameInsetPaddingCSS({
      bottom: 3,
      left: 4,
      right: 2,
      top: 1,
    })).toBe('1px 2px 3px 4px')
    expect(getSlideEditTextFrameInsetPaddingCSS({
      bottom: Number.POSITIVE_INFINITY,
      left: 5.678,
      right: -2,
      top: 1,
    })).toBe('1px 0px 0px 5.68px')
  })

  it('normalizes inset numeric boundaries before host application', () => {
    expect(normalizeSlideEditTextFrameInsetValue(Number.NaN)).toBe(0)
    expect(normalizeSlideEditTextFrameInsetValue(-12)).toBe(0)
    expect(normalizeSlideEditTextFrameInsetValue(12.345)).toBe(12.35)
    expect(normalizeSlideEditTextFrameInsetValue(
      SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max + 1,
    )).toBe(SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max)

    expect(normalizeSlideEditTextFrameInset({
      bottom: Number.POSITIVE_INFINITY,
      left: 5.678,
      right: -2,
      top: 1,
    })).toEqual({
      bottom: 0,
      left: 5.68,
      right: 0,
      top: 1,
    })
  })

  it('routes selected text object inset changes through host command effects', () => {
    expect(getSlideEditTextFrameInsetCommandEffect({
      fieldId: 'left',
      id: 'update-text-frame-inset',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 8.5,
    })).toEqual({
      payload: {
        fieldId: 'left',
        id: 'update-text-frame-inset',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 8.5,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditTextFrameInsetCommandEffect({
      fieldId: 'top',
      id: 'update-text-frame-inset',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: -4,
    }).payload.value).toBe(0)
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextFrameInsetDescriptor({
        inset: {
          bottom: 10,
          left: 4,
          right: 4,
          top: 10,
        },
        objectId: 'object-a',
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
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

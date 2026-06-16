import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectOpacityDescriptor,
  getSlideEditObjectOpacityCommandEffect,
  getSlideEditObjectOpacityMetadata,
  normalizeSlideEditObjectOpacity,
  SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
  SLIDE_EDIT_OBJECT_OPACITY_FIELD,
  SLIDE_EDIT_OBJECT_OPACITY_LIMITS,
  toSlideEditObjectOpacityAttributeValue,
} from './SlideEditObjectOpacity'

describe('SlideEditObjectOpacity', () => {
  it('creates an object opacity descriptor with fully opaque as default', () => {
    expect(createSlideEditObjectOpacityDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_OBJECT_OPACITY_FIELD,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE,
        attributeValue: '1',
        defaultValue: SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
        value: 1,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-opacity',
      value: 1,
    })
  })

  it('documents the allowed opacity range and metadata attribute', () => {
    expect(SLIDE_EDIT_OBJECT_OPACITY_FIELD).toMatchObject({
      commandId: 'update-object-opacity',
      control: 'opacity-slider',
      id: 'opacity',
      max: 1,
      min: 0,
      requiredAdapterSlot: 'command-effect',
      step: 0.01,
      unit: 'ratio',
    })
    expect(SLIDE_EDIT_OBJECT_OPACITY_LIMITS).toEqual({
      max: 1,
      min: 0,
    })
    expect(getSlideEditObjectOpacityMetadata(0.42)).toEqual({
      attribute: 'data-slide-object-opacity',
      attributeValue: '0.42',
      defaultValue: 1,
      value: 0.42,
    })
  })

  it('normalizes opacity values to the 0..1 contract range', () => {
    expect(normalizeSlideEditObjectOpacity(Number.NaN)).toBe(1)
    expect(normalizeSlideEditObjectOpacity(null)).toBe(1)
    expect(normalizeSlideEditObjectOpacity(-0.2)).toBe(0)
    expect(normalizeSlideEditObjectOpacity(0.335)).toBe(0.34)
    expect(normalizeSlideEditObjectOpacity(1.2)).toBe(1)
    expect(toSlideEditObjectOpacityAttributeValue(0.5)).toBe('0.5')
  })

  it('routes selected object opacity updates through host command effects', () => {
    expect(getSlideEditObjectOpacityCommandEffect({
      fieldId: 'opacity',
      id: 'update-object-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 0.65,
    })).toEqual({
      payload: {
        fieldId: 'opacity',
        id: 'update-object-opacity',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 0.65,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditObjectOpacityCommandEffect({
      fieldId: 'opacity',
      id: 'update-object-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 2,
    }).payload.value).toBe(1)
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectOpacityDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 0.5,
      }),
      field: SLIDE_EDIT_OBJECT_OPACITY_FIELD,
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

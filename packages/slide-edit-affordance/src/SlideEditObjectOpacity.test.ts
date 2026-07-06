import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectOpacityDescriptor,
  getSlideEditObjectOpacityCommandEffect,
  getSlideEditObjectOpacityJSONPasteValueFromValue,
  getSlideEditObjectOpacityMetadata,
  getSlideEditObjectOpacityPasteCommand,
  normalizeSlideEditObjectOpacity,
  SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
  SLIDE_EDIT_OBJECT_OPACITY_FIELD,
  SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL,
  SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT,
  SLIDE_EDIT_OBJECT_OPACITY_LIMITS,
  toSlideEditObjectOpacityAttributeValue,
} from './SlideEditObjectOpacity'
import {
  SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL as SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL_FROM_PACKAGE,
  SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT as SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT_FROM_PACKAGE,
} from './index'

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

  it('exports object opacity import model and format metadata', () => {
    expect(SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL)
      .toBe('slide-edit-object-opacity-import')
    expect(SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT)
      .toBe('application-json-slide-edit-object-opacity')
    expect(SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL)
    expect(SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT)
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

  it('parses object opacity JSON paste values into update commands', () => {
    const pasteValue = getSlideEditObjectOpacityJSONPasteValueFromValue(
      { objectOpacity: { value: '0.375' } },
      { mode: 'wrapped' },
    )

    expect(pasteValue).toEqual({
      value: 0.38,
    })
    expect(pasteValue && getSlideEditObjectOpacityPasteCommand({
      objectId: 'object-a',
      pasteValue,
      slideId: 'slide-a',
    })).toEqual({
      fieldId: 'opacity',
      id: 'update-object-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 0.38,
    })
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

import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectShadowDescriptor,
  getSlideEditObjectShadowCommandEffect,
  getSlideEditObjectShadowColorCSS,
  getSlideEditObjectShadowFilter,
  getSlideEditObjectShadowFilterCSS,
  getSlideEditObjectShadowMetadata,
  normalizeSlideEditObjectShadow,
  normalizeSlideEditObjectShadowFieldValue,
  shouldEmitSlideEditObjectShadowMetadata,
  SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
  SLIDE_EDIT_OBJECT_SHADOW_FIELDS,
  toSlideEditObjectShadowAttributeValue,
} from './SlideEditObjectShadow'

describe('SlideEditObjectShadow', () => {
  it('creates a disabled object shadow descriptor by default', () => {
    expect(createSlideEditObjectShadowDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_OBJECT_SHADOW_FIELDS,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE,
        attributeValue: 'none',
        defaultValue: 'none',
        isEnabled: false,
        shadow: SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
      },
      objectId: 'object-a',
      shadow: SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
      slideId: 'slide-a',
      surface: 'object-shadow',
    })
  })

  it('defines product-neutral shadow fields for selected slide objects', () => {
    expect(SLIDE_EDIT_OBJECT_SHADOW_FIELDS.map((field) => field.id))
      .toEqual([
        'enabled',
        'color',
        'opacity',
        'blur',
        'angle',
        'distance',
      ])
    expect(SLIDE_EDIT_OBJECT_SHADOW_FIELDS.every((field) =>
      field.commandId === 'update-object-shadow' &&
      field.requiredAdapterSlot === 'command-effect'
    )).toBe(true)
  })

  it('uses disabled metadata that hosts can omit or render as none', () => {
    expect(shouldEmitSlideEditObjectShadowMetadata({
      enabled: false,
      opacity: 0.5,
    })).toBe(false)
    expect(getSlideEditObjectShadowMetadata({
      enabled: false,
      opacity: 0.5,
    })).toMatchObject({
      attribute: 'data-slide-object-shadow',
      attributeValue: 'none',
      isEnabled: false,
    })
  })

  it('serializes enabled shadow metadata for shared runtime surfaces', () => {
    const attributeValue = toSlideEditObjectShadowAttributeValue({
      angle: 30.123,
      blur: 16.4,
      color: '#123456',
      distance: 8,
      enabled: true,
      opacity: 0.4,
    })

    expect(JSON.parse(attributeValue)).toEqual({
      angle: 30.12,
      blur: 16.4,
      color: '#123456',
      distance: 8,
      enabled: true,
      opacity: 0.4,
    })
    expect(getSlideEditObjectShadowMetadata({
      enabled: true,
    })).toMatchObject({
      attribute: 'data-slide-object-shadow',
      isEnabled: true,
    })
  })

  it('normalizes shadow field values before host application', () => {
    expect(normalizeSlideEditObjectShadow({
      angle: Number.POSITIVE_INFINITY,
      blur: -4,
      color: '  ',
      distance: 1001,
      enabled: true,
      opacity: 1.2,
    })).toEqual({
      angle: SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.angle,
      blur: 0,
      color: SLIDE_EDIT_OBJECT_SHADOW_DEFAULT.color,
      distance: 1000,
      enabled: true,
      opacity: 1,
    })
    expect(normalizeSlideEditObjectShadowFieldValue('opacity', 0.335))
      .toBe(0.34)
    expect(normalizeSlideEditObjectShadowFieldValue('enabled', 'true'))
      .toBe(false)
  })

  it('maps enabled object shadows to CSS filter values', () => {
    const shadow = {
      angle: 30,
      blur: 16,
      color: '#123456',
      distance: 8,
      enabled: true,
      opacity: 0.4,
    }

    expect(getSlideEditObjectShadowFilterCSS(shadow))
      .toBe('6.93px 4px 16px rgb(18 52 86 / 0.4)')
    expect(getSlideEditObjectShadowFilter(shadow))
      .toBe('drop-shadow(6.93px 4px 16px rgb(18 52 86 / 0.4))')
  })

  it('omits disabled object shadow filters and preserves custom colors', () => {
    expect(getSlideEditObjectShadowFilter({
      enabled: false,
    })).toBeUndefined()
    expect(getSlideEditObjectShadowColorCSS({
      color: 'color-mix(in srgb, black 40%, transparent)',
      enabled: true,
      opacity: 0.5,
    })).toBe('color-mix(in srgb, black 40%, transparent)')
  })

  it('routes selected object shadow updates through host command effects', () => {
    expect(getSlideEditObjectShadowCommandEffect({
      fieldId: 'blur',
      id: 'update-object-shadow',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: -8,
    })).toEqual({
      payload: {
        fieldId: 'blur',
        id: 'update-object-shadow',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 0,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('distinguishes content object shadow from demo chrome shadow strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectShadowDescriptor({
        objectId: 'object-a',
        shadow: {
          enabled: true,
        },
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_OBJECT_SHADOW_FIELDS,
    }).toLowerCase()

    for (const blockedTerm of [
      'chrome',
      'decoration',
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

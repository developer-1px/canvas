import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectAccessibilityDescriptor,
  getSlideEditObjectAccessibilityCommandEffect,
  getSlideEditObjectAccessibilityMetadata,
  normalizeSlideEditObjectAccessibility,
  normalizeSlideEditObjectAccessibilityFieldValue,
  shouldEmitSlideEditObjectAccessibilityMetadata,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS,
  toSlideEditObjectAccessibilityAttributeValue,
} from './SlideEditObjectAccessibility'

describe('SlideEditObjectAccessibility', () => {
  it('creates an object accessibility descriptor with no alt text by default', () => {
    expect(createSlideEditObjectAccessibilityDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE,
        attributeValue: 'none',
        defaultValue: 'none',
        isDecorative: false,
        isDescribed: false,
        value: SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-accessibility',
      value: SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT,
    })
  })

  it('defines product-neutral alt text and decorative fields', () => {
    expect(SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS.map((field) => field.id))
      .toEqual([
        'altText',
        'decorative',
      ])
    expect(SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS.every((field) =>
      field.commandId === 'update-object-accessibility' &&
      field.requiredAdapterSlot === 'command-effect'
    )).toBe(true)
  })

  it('serializes described object metadata for shared runtime surfaces', () => {
    const attributeValue = toSlideEditObjectAccessibilityAttributeValue({
      altText: '  Quarterly growth chart ',
      decorative: false,
    })

    expect(JSON.parse(attributeValue)).toEqual({
      altText: 'Quarterly growth chart',
      decorative: false,
    })
    expect(getSlideEditObjectAccessibilityMetadata({
      altText: 'Quarterly growth chart',
    })).toMatchObject({
      attribute: 'data-slide-object-accessibility',
      isDecorative: false,
      isDescribed: true,
    })
  })

  it('lets decorative objects clear description while keeping metadata', () => {
    expect(normalizeSlideEditObjectAccessibility({
      altText: 'Logo',
      decorative: true,
    })).toEqual({
      altText: '',
      decorative: true,
    })
    expect(shouldEmitSlideEditObjectAccessibilityMetadata({
      decorative: true,
    })).toBe(true)
    expect(JSON.parse(toSlideEditObjectAccessibilityAttributeValue({
      decorative: true,
    }))).toEqual({
      altText: '',
      decorative: true,
    })
  })

  it('normalizes field updates before host application', () => {
    expect(normalizeSlideEditObjectAccessibilityFieldValue(
      'altText',
      '  Product screenshot ',
    )).toBe('Product screenshot')
    expect(normalizeSlideEditObjectAccessibilityFieldValue(
      'decorative',
      'true',
    )).toBe(false)
    expect(normalizeSlideEditObjectAccessibilityFieldValue(
      'decorative',
      true,
    )).toBe(true)
  })

  it('routes alt text updates and removal through host command effects', () => {
    expect(getSlideEditObjectAccessibilityCommandEffect({
      fieldId: 'altText',
      id: 'update-object-accessibility',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: '  Revenue chart ',
    })).toEqual({
      payload: {
        fieldId: 'altText',
        id: 'update-object-accessibility',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'Revenue chart',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditObjectAccessibilityCommandEffect({
      id: 'remove-object-alt-text',
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'remove-object-alt-text',
        objectId: 'object-a',
        slideId: 'slide-a',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('separates slide content alt text from UI aria label strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectAccessibilityDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: {
          altText: 'Product screenshot',
        },
      }),
      fields: SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS,
    }).toLowerCase()

    for (const blockedTerm of [
      'aria-label',
      'button-label',
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

import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectAccessibilityDescriptor,
  getSlideEditObjectAccessibilityCommandEffect,
  getSlideEditObjectAccessibilityJSONPasteValue,
  getSlideEditObjectAccessibilityMetadata,
  getSlideEditObjectAccessibilityPasteCommand,
  normalizeSlideEditObjectAccessibility,
  normalizeSlideEditObjectAccessibilityFieldValue,
  normalizeSlideEditObjectAltTextStorageValue,
  shouldEmitSlideEditObjectAccessibilityMetadata,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_DEFAULT,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_FIELDS,
  SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE,
  toSlideEditObjectAccessibilityAttributeValue,
} from './SlideEditObjectAccessibility'
import {
  getSlideEditObjectAccessibilityJSONPasteValue as getSlideEditObjectAccessibilityJSONPasteValueFromPackage,
} from './index'

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

  it('normalizes host storage alt text with configurable policy', () => {
    expect(normalizeSlideEditObjectAltTextStorageValue(
      '  Revenue chart summary  ',
      { maxLength: 13 },
    )).toBe('Revenue chart')
    expect(normalizeSlideEditObjectAltTextStorageValue('   ')).toBeNull()
    expect(normalizeSlideEditObjectAltTextStorageValue(
      'Revenue\u0007chart',
    )).toBeNull()
    expect(normalizeSlideEditObjectAltTextStorageValue(
      'Revenue\u0007chart',
      { rejectControlCharacters: false },
    )).toBe('Revenue\u0007chart')
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

  it('reads custom MIME direct alt text before general JSON wrappers', () => {
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE]:
          '"  Revenue chart summary  "',
        'application/json': '{"objectAltText":"Ignored"}',
      }),
      storagePolicy: {
        maxLength: 13,
      },
    })).toEqual({
      altText: 'Revenue chart',
      kind: 'alt-text',
      value: {
        altText: 'Revenue chart',
        decorative: false,
      },
    })
    expect(getSlideEditObjectAccessibilityJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE]:
          '{"altText":"Product screenshot"}',
      }),
    })).toMatchObject({
      altText: 'Product screenshot',
      kind: 'alt-text',
    })
  })

  it('reads explicit object accessibility wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json':
          '{"objectAccessibility":{"altText":"Product photo"}}',
      }),
    })).toMatchObject({
      altText: 'Product photo',
      kind: 'alt-text',
    })
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"accessibility":{"decorative":true}}',
      }),
    })).toEqual({
      kind: 'decorative',
      value: {
        altText: '',
        decorative: true,
      },
    })
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectAltText":"Logo"}',
      }),
    })).toMatchObject({
      altText: 'Logo',
      kind: 'alt-text',
    })
  })

  it('turns null, false, empty string, and decorative downgrade into command-ready values', () => {
    for (const payload of [
      'null',
      'false',
      '""',
      '{"decorative":false}',
    ]) {
      expect(getSlideEditObjectAccessibilityJSONPasteValue({
        dataTransfer: createDataTransfer({
          [SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE]: payload,
        }),
      })).toEqual({
        kind: 'remove-alt-text',
        value: {
          altText: '',
          decorative: false,
        },
      })
    }

    const decorativePasteValue = getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE]:
          '{"decorative":true}',
      }),
    })

    expect(decorativePasteValue).toEqual({
      kind: 'decorative',
      value: {
        altText: '',
        decorative: true,
      },
    })
    expect(getSlideEditObjectAccessibilityPasteCommand({
      objectId: 'object-a',
      pasteValue: decorativePasteValue!,
      slideId: 'slide-a',
    })).toEqual({
      fieldId: 'decorative',
      id: 'update-object-accessibility',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: true,
    })
    expect(getSlideEditObjectAccessibilityPasteCommand({
      objectId: 'object-a',
      pasteValue: decorativePasteValue!,
      slideId: 'slide-a',
      supportsDecorative: false,
    })).toEqual({
      id: 'remove-object-alt-text',
      objectId: 'object-a',
      slideId: 'slide-a',
    })
  })

  it('converts paste values into host accessibility commands', () => {
    const pasteValue = getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectAltText":"Product screenshot"}',
      }),
    })

    expect(getSlideEditObjectAccessibilityPasteCommand({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual({
      fieldId: 'altText',
      id: 'update-object-accessibility',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'Product screenshot',
    })
    expect(getSlideEditObjectAccessibilityCommandEffect(
      getSlideEditObjectAccessibilityPasteCommand({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      }),
    ).type).toBe('slide-command-effect')
  })

  it('ignores invalid, unrelated, and UI aria label JSON candidates', () => {
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"UI aria label"',
      }),
    })).toBeNull()
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"ariaLabel":"UI label"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectAltText":"Bad\\u0007label"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_ACCESSIBILITY_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
    expect(getSlideEditObjectAccessibilityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'not json',
      }),
    })).toBeNull()
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

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

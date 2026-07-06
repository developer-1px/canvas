import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectFillOpacityDescriptor,
  getSlideEditObjectFillOpacityCommandEffect,
  getSlideEditObjectFillOpacityJSONPasteValue,
  getSlideEditObjectFillOpacityJSONPasteValueFromText,
  getSlideEditObjectFillOpacityJSONPasteValueFromValue,
  getSlideEditObjectFillOpacityMetadata,
  getSlideEditObjectFillOpacityPasteCommand,
  normalizeSlideEditObjectFillOpacity,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE,
  SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS,
  toSlideEditObjectFillOpacityAttributeValue,
} from './SlideEditObjectFillOpacity'
import {
  getSlideEditObjectFillOpacityJSONPasteValue as getSlideEditObjectFillOpacityJSONPasteValueFromPackage,
  getSlideEditObjectFillOpacityJSONPasteValueFromText as getSlideEditObjectFillOpacityJSONPasteValueFromTextFromPackage,
  getSlideEditObjectFillOpacityJSONPasteValueFromValue as getSlideEditObjectFillOpacityJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditObjectFillOpacity', () => {
  it('creates a supported fill opacity descriptor with fully opaque as default', () => {
    expect(createSlideEditObjectFillOpacityDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD,
      isSupported: true,
      limits: SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_FILL_OPACITY_DATA_ATTRIBUTE,
        attributeValue: '1',
        defaultValue: SLIDE_EDIT_OBJECT_FILL_OPACITY_DEFAULT,
        isSupported: true,
        unsupportedReason: undefined,
        value: 1,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-fill-opacity',
      unsupportedReason: undefined,
      value: 1,
    })
  })

  it('documents fill-only numeric bounds and field identity', () => {
    expect(SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD).toMatchObject({
      commandId: 'update-object-fill-opacity',
      control: 'fill-opacity-slider',
      id: 'fillOpacity',
      max: 1,
      min: 0,
      requiredAdapterSlot: 'command-effect',
      step: 0.01,
      unit: 'ratio',
    })
    expect(SLIDE_EDIT_OBJECT_FILL_OPACITY_LIMITS).toEqual({
      max: 1,
      min: 0,
    })
    expect(getSlideEditObjectFillOpacityMetadata({
      value: 0.42,
    })).toEqual({
      attribute: 'data-slide-object-fill-opacity',
      attributeValue: '0.42',
      defaultValue: 1,
      isSupported: true,
      unsupportedReason: undefined,
      value: 0.42,
    })
  })

  it('expresses unsupported state for objects without fill', () => {
    expect(createSlideEditObjectFillOpacityDescriptor({
      isSupported: false,
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 0.5,
    })).toMatchObject({
      isSupported: false,
      metadata: {
        attributeValue: 'unsupported',
        isSupported: false,
        unsupportedReason: 'no-fill',
        value: 0.5,
      },
      unsupportedReason: 'no-fill',
    })
    expect(getSlideEditObjectFillOpacityMetadata({
      isSupported: false,
      unsupportedReason: 'mixed-selection',
      value: 0.7,
    })).toMatchObject({
      attribute: 'data-slide-object-fill-opacity',
      attributeValue: 'unsupported',
      isSupported: false,
      unsupportedReason: 'mixed-selection',
      value: 0.7,
    })
  })

  it('normalizes fill opacity values to the 0..1 contract range', () => {
    expect(normalizeSlideEditObjectFillOpacity(Number.NaN)).toBe(1)
    expect(normalizeSlideEditObjectFillOpacity(null)).toBe(1)
    expect(normalizeSlideEditObjectFillOpacity(-0.2)).toBe(0)
    expect(normalizeSlideEditObjectFillOpacity(0.335)).toBe(0.34)
    expect(normalizeSlideEditObjectFillOpacity(1.2)).toBe(1)
    expect(toSlideEditObjectFillOpacityAttributeValue(0.5)).toBe('0.5')
  })

  it('routes selected object fill opacity updates through host command effects', () => {
    expect(getSlideEditObjectFillOpacityCommandEffect({
      fieldId: 'fillOpacity',
      id: 'update-object-fill-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 0.65,
    })).toEqual({
      payload: {
        fieldId: 'fillOpacity',
        id: 'update-object-fill-opacity',
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

    expect(getSlideEditObjectFillOpacityCommandEffect({
      fieldId: 'fillOpacity',
      id: 'update-object-fill-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 2,
    }).payload.value).toBe(1)
  })

  it('reads custom MIME direct fill opacity JSON values first', () => {
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE]: '"0.62"',
        'application/json': '{"fillOpacity":0.2}',
      }),
    })).toEqual({
      value: 0.62,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE]:
          '{"opacity":"0.335"}',
      }),
    })).toEqual({
      value: 0.34,
    })
  })

  it('reads explicit fill opacity wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"objectFillOpacity":{"value":"0.62"}}',
      }),
    })).toEqual({
      value: 0.62,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"shapeFillOpacity":0.335}',
      }),
    })).toEqual({
      value: 0.34,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fillOpacity":{"value":1.2}}',
      }),
    })).toEqual({
      value: 1,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fillOpacity":0}',
      }),
    })).toEqual({
      value: 0,
    })
  })

  it('reads fill opacity JSON from text and parsed values', () => {
    expect(getSlideEditObjectFillOpacityJSONPasteValueFromText(
      '"0.62"',
    )).toEqual({
      value: 0.62,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValueFromValue({
      opacity: '0.335',
    })).toEqual({
      value: 0.34,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValueFromTextFromPackage(
      '{"shapeFillOpacity":0.335}',
      { mode: 'wrapped' },
    )).toEqual({
      value: 0.34,
    })
    expect(getSlideEditObjectFillOpacityJSONPasteValueFromValueFromPackage(
      { fillOpacity: { value: 1.2 } },
      { mode: 'wrapped' },
    )).toEqual({
      value: 1,
    })
  })

  it('converts fill opacity paste values into host commands', () => {
    const pasteValue = getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fillOpacity":"0.62"}',
      }),
    })

    expect(getSlideEditObjectFillOpacityPasteCommand({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual({
      fieldId: 'fillOpacity',
      id: 'update-object-fill-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 0.62,
    })
    expect(getSlideEditObjectFillOpacityCommandEffect(
      getSlideEditObjectFillOpacityPasteCommand({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      }),
    ).type).toBe('slide-command-effect')
  })

  it('ignores invalid, object opacity, and unrelated fill opacity JSON', () => {
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '0.62',
      }),
    })).toBeNull()
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"opacity":0.62}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":0.62}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fillOpacity":"transparent"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
    expect(getSlideEditObjectFillOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_FILL_OPACITY_JSON_MIME_TYPE]: '"Infinity"',
      }),
    })).toBeNull()
  })

  it('does not collapse fill opacity into object opacity or product terms', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectFillOpacityDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 0.5,
      }),
      field: SLIDE_EDIT_OBJECT_FILL_OPACITY_FIELD,
    }).toLowerCase()

    for (const blockedTerm of [
      'canvasitem',
      'engine-shape',
      'data-slide-object-opacity',
      'object-opacity',
      'update-object-opacity',
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

function createDataTransfer(
  values: Record<string, string>,
): Pick<DataTransfer, 'getData'> {
  return {
    getData(type) {
      return values[type] ?? ''
    },
  }
}

import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectOpacityDescriptor,
  getSlideEditObjectOpacityCommandEffect,
  getSlideEditObjectOpacityJSONPasteValue,
  getSlideEditObjectOpacityJSONPasteValueFromText,
  getSlideEditObjectOpacityJSONPasteValueFromValue,
  getSlideEditObjectOpacityMetadata,
  getSlideEditObjectOpacityPasteCommand,
  normalizeSlideEditObjectOpacity,
  SLIDE_EDIT_OBJECT_OPACITY_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_OPACITY_DEFAULT,
  SLIDE_EDIT_OBJECT_OPACITY_FIELD,
  SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL,
  SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT,
  SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE,
  SLIDE_EDIT_OBJECT_OPACITY_LIMITS,
  toSlideEditObjectOpacityAttributeValue,
} from './SlideEditObjectOpacity'
import {
  getSlideEditObjectOpacityJSONPasteValue as getSlideEditObjectOpacityJSONPasteValueFromPackage,
  getSlideEditObjectOpacityJSONPasteValueFromText as getSlideEditObjectOpacityJSONPasteValueFromTextFromPackage,
  getSlideEditObjectOpacityJSONPasteValueFromValue as getSlideEditObjectOpacityJSONPasteValueFromValueFromPackage,
  SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL as SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL_FROM_PACKAGE,
  SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT as SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT_FROM_PACKAGE,
} from './index'

describe('SlideEditObjectOpacity', () => {
  it('exposes shared object opacity import metadata', () => {
    expect(SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL).toBe(
      'slide-edit-object-opacity-import',
    )
    expect(SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT).toBe(
      'application-json-slide-edit-object-opacity',
    )
    expect(SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL_FROM_PACKAGE).toBe(
      SLIDE_EDIT_OBJECT_OPACITY_IMPORT_MODEL,
    )
    expect(SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT_FROM_PACKAGE).toBe(
      SLIDE_EDIT_OBJECT_OPACITY_JSON_IMPORT_FORMAT,
    )
  })

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

  it('reads custom MIME direct object opacity JSON values first', () => {
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE]: '"0.67"',
        'application/json': '{"objectOpacity":0.2}',
      }),
    })).toEqual({
      value: 0.67,
    })
    expect(getSlideEditObjectOpacityJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE]: '{"opacity":"0.335"}',
      }),
    })).toEqual({
      value: 0.34,
    })
  })

  it('reads explicit object opacity wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"objectOpacity":{"value":"0.67"}}',
      }),
    })).toEqual({
      value: 0.67,
    })
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"objectOpacityValue":0.335}',
      }),
    })).toEqual({
      value: 0.34,
    })
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectOpacity":{"opacity":1.2}}',
      }),
    })).toEqual({
      value: 1,
    })
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectOpacity":0}',
      }),
    })).toEqual({
      value: 0,
    })
  })

  it('reads object opacity JSON from text and parsed values', () => {
    expect(getSlideEditObjectOpacityJSONPasteValueFromText(
      '{"objectOpacity":{"value":"0.67"}}',
      { mode: 'wrapped' },
    )).toEqual({
      value: 0.67,
    })
    expect(getSlideEditObjectOpacityJSONPasteValueFromValue({
      opacity: 0.335,
    })).toEqual({
      value: 0.34,
    })
    expect(getSlideEditObjectOpacityJSONPasteValueFromTextFromPackage(
      '{"objectOpacityValue":0}',
      { mode: 'wrapped' },
    )).toEqual({
      value: 0,
    })
    expect(getSlideEditObjectOpacityJSONPasteValueFromValueFromPackage({
      value: '1.2',
    })).toEqual({
      value: 1,
    })
  })

  it('converts object opacity paste values into host commands', () => {
    const pasteValue = getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectOpacity":"0.67"}',
      }),
    })

    expect(getSlideEditObjectOpacityPasteCommand({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual({
      fieldId: 'opacity',
      id: 'update-object-opacity',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 0.67,
    })
    expect(getSlideEditObjectOpacityCommandEffect(
      getSlideEditObjectOpacityPasteCommand({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      }),
    ).type).toBe('slide-command-effect')
  })

  it('ignores invalid, fill opacity, and unrelated object opacity JSON', () => {
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '0.67',
      }),
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"opacity":0.67}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"fillOpacity":0.67}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":0.67}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"objectOpacity":"transparent"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
    expect(getSlideEditObjectOpacityJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_OPACITY_JSON_MIME_TYPE]: '"Infinity"',
      }),
    })).toBeNull()
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

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

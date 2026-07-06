import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectCornerRadiusDescriptor,
  getSlideEditObjectCornerRadiusCommandEffect,
  getSlideEditObjectCornerRadiusCSS,
  getSlideEditObjectCornerRadiusJSONPasteValue,
  getSlideEditObjectCornerRadiusJSONPasteValueFromText,
  getSlideEditObjectCornerRadiusJSONPasteValueFromValue,
  getSlideEditObjectCornerRadiusMetadata,
  getSlideEditObjectCornerRadiusPasteCommand,
  getSlideEditObjectCornerRadiusPreviewCSS,
  normalizeSlideEditObjectCornerRadius,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE,
  SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS,
  toSlideEditObjectCornerRadiusAttributeValue,
} from './SlideEditObjectCornerRadius'
import {
  getSlideEditObjectCornerRadiusJSONPasteValue as getSlideEditObjectCornerRadiusJSONPasteValueFromPackage,
  getSlideEditObjectCornerRadiusJSONPasteValueFromText as getSlideEditObjectCornerRadiusJSONPasteValueFromTextFromPackage,
  getSlideEditObjectCornerRadiusJSONPasteValueFromValue as getSlideEditObjectCornerRadiusJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditObjectCornerRadius', () => {
  it('creates a supported corner radius descriptor with square corners as default', () => {
    expect(createSlideEditObjectCornerRadiusDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD,
      isSupported: true,
      limits: SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_CORNER_RADIUS_DATA_ATTRIBUTE,
        attributeValue: '0',
        defaultValue: SLIDE_EDIT_OBJECT_CORNER_RADIUS_DEFAULT,
        isSupported: true,
        unsupportedReason: undefined,
        value: 0,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-corner-radius',
      unsupportedReason: undefined,
      value: 0,
    })
  })

  it('documents numeric bounds and step for rounded rectangle style shapes', () => {
    expect(SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD).toMatchObject({
      commandId: 'update-object-corner-radius',
      control: 'corner-radius-slider',
      id: 'cornerRadius',
      max: 1000,
      min: 0,
      requiredAdapterSlot: 'command-effect',
      step: 1,
      unit: 'px',
    })
    expect(SLIDE_EDIT_OBJECT_CORNER_RADIUS_LIMITS).toEqual({
      max: 1000,
      min: 0,
    })
    expect(getSlideEditObjectCornerRadiusMetadata({
      value: 12.5,
    })).toEqual({
      attribute: 'data-slide-object-corner-radius',
      attributeValue: '12.5',
      defaultValue: 0,
      isSupported: true,
      unsupportedReason: undefined,
      value: 12.5,
    })
  })

  it('expresses unsupported state for non-rounded shape selections', () => {
    expect(createSlideEditObjectCornerRadiusDescriptor({
      isSupported: false,
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 8,
    })).toMatchObject({
      isSupported: false,
      metadata: {
        attributeValue: 'unsupported',
        isSupported: false,
        unsupportedReason: 'unsupported-shape',
        value: 8,
      },
      unsupportedReason: 'unsupported-shape',
    })
    expect(getSlideEditObjectCornerRadiusMetadata({
      isSupported: false,
      unsupportedReason: 'mixed-selection',
      value: 10,
    })).toMatchObject({
      attribute: 'data-slide-object-corner-radius',
      attributeValue: 'unsupported',
      isSupported: false,
      unsupportedReason: 'mixed-selection',
      value: 10,
    })
  })

  it('normalizes corner radius values to the bounded contract range', () => {
    expect(normalizeSlideEditObjectCornerRadius(Number.NaN)).toBe(0)
    expect(normalizeSlideEditObjectCornerRadius(null)).toBe(0)
    expect(normalizeSlideEditObjectCornerRadius(-2)).toBe(0)
    expect(normalizeSlideEditObjectCornerRadius(12.345)).toBe(12.35)
    expect(normalizeSlideEditObjectCornerRadius(1200)).toBe(1000)
    expect(toSlideEditObjectCornerRadiusAttributeValue(14)).toBe('14')
  })

  it('formats normalized corner radius values for CSS rendering', () => {
    expect(getSlideEditObjectCornerRadiusCSS(12.345)).toBe('12.35px')
    expect(getSlideEditObjectCornerRadiusCSS(Number.NaN)).toBe('0px')
    expect(getSlideEditObjectCornerRadiusPreviewCSS({
      h: 80,
      value: 20,
      w: 160,
    })).toBe('25%')
    expect(getSlideEditObjectCornerRadiusPreviewCSS({
      h: 80,
      value: 80,
      w: 160,
    })).toBe('50%')
    expect(getSlideEditObjectCornerRadiusPreviewCSS({
      h: Number.NaN,
      value: 0.25,
      w: 0,
    })).toBe('25%')
  })

  it('routes selected object corner radius updates through host command effects', () => {
    expect(getSlideEditObjectCornerRadiusCommandEffect({
      fieldId: 'cornerRadius',
      id: 'update-object-corner-radius',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 24,
    })).toEqual({
      payload: {
        fieldId: 'cornerRadius',
        id: 'update-object-corner-radius',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 24,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditObjectCornerRadiusCommandEffect({
      fieldId: 'cornerRadius',
      id: 'update-object-corner-radius',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: -4,
    }).payload.value).toBe(0)
  })

  it('reads custom MIME direct corner radius JSON values first', () => {
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE]: '"18"',
        'application/json': '{"cornerRadius":4}',
      }),
    })).toEqual({
      value: 18,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE]:
          '{"radius":"24.126"}',
      }),
    })).toEqual({
      value: 24.13,
    })
  })

  it('reads explicit corner radius wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"objectCornerRadius":{"value":"18"}}',
      }),
    })).toEqual({
      value: 18,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"shapeCornerRadius":12.345}',
      }),
    })).toEqual({
      value: 12.35,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"cornerRadius":{"radius":1200}}',
      }),
    })).toEqual({
      value: 1000,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"cornerRadius":0}',
      }),
    })).toEqual({
      value: 0,
    })
  })

  it('reads corner radius JSON from text and parsed values', () => {
    expect(getSlideEditObjectCornerRadiusJSONPasteValueFromText(
      '"18"',
    )).toEqual({
      value: 18,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValueFromValue({
      radius: '24.126',
    })).toEqual({
      value: 24.13,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValueFromTextFromPackage(
      '{"shapeCornerRadius":12.345}',
      { mode: 'wrapped' },
    )).toEqual({
      value: 12.35,
    })
    expect(getSlideEditObjectCornerRadiusJSONPasteValueFromValueFromPackage(
      { cornerRadius: { radius: 1200 } },
      { mode: 'wrapped' },
    )).toEqual({
      value: 1000,
    })
  })

  it('converts corner radius paste values into host commands', () => {
    const pasteValue = getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"cornerRadius":"18"}',
      }),
    })

    expect(getSlideEditObjectCornerRadiusPasteCommand({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual({
      fieldId: 'cornerRadius',
      id: 'update-object-corner-radius',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 18,
    })
    expect(getSlideEditObjectCornerRadiusCommandEffect(
      getSlideEditObjectCornerRadiusPasteCommand({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      }),
    ).type).toBe('slide-command-effect')
  })

  it('ignores invalid, direct generic, and unrelated corner radius JSON', () => {
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '18',
      }),
    })).toBeNull()
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"radius":18}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":18}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"cornerRadius":"wide"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
    expect(getSlideEditObjectCornerRadiusJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_CORNER_RADIUS_JSON_MIME_TYPE]: '"NaN"',
      }),
    })).toBeNull()
  })

  it('does not expose host renderer names or product model terms', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectCornerRadiusDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 16,
      }),
      field: SLIDE_EDIT_OBJECT_CORNER_RADIUS_FIELD,
    }).toLowerCase()

    for (const blockedTerm of [
      'border-radius',
      'canvasitem',
      'engine-shape',
      'p' + 'pt',
      'p' + 'ptx',
      'power' + 'point',
      'fig' + 'slide',
      'slide-store',
      'document-model',
      'svg',
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

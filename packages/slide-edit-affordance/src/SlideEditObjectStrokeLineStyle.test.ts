import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectStrokeLineStyleDescriptor,
  getSlideEditObjectStrokeLineStyleCommandEffect,
  getSlideEditObjectStrokeLineStyleBorderStyle,
  getSlideEditObjectStrokeLineStyleDashArray,
  getSlideEditObjectStrokeLineStyleJSONPasteValue,
  getSlideEditObjectStrokeLineStyleMetadata,
  getSlideEditObjectStrokeLineStylePasteCommand,
  isSlideEditObjectStrokeLineStyleValue,
  normalizeSlideEditObjectStrokeLineStyle,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE,
  SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_OPTIONS,
} from './SlideEditObjectStrokeLineStyle'
import {
  getSlideEditObjectStrokeLineStyleJSONPasteValue as getSlideEditObjectStrokeLineStyleJSONPasteValueFromPackage,
} from './index'

describe('SlideEditObjectStrokeLineStyle', () => {
  it('creates a supported stroke line style descriptor with solid as default', () => {
    expect(createSlideEditObjectStrokeLineStyleDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD,
      isSupported: true,
      metadata: {
        attribute: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DATA_ATTRIBUTE,
        attributeValue: 'solid',
        defaultValue: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_DEFAULT,
        isSupported: true,
        unsupportedReason: undefined,
        value: 'solid',
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'object-stroke-line-style',
      unsupportedReason: undefined,
      value: 'solid',
    })
  })

  it('documents the supported solid dash and dot subset', () => {
    expect(SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_OPTIONS.map((option) =>
      option.id
    )).toEqual([
      'solid',
      'dash',
      'dot',
    ])
    expect(SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD).toMatchObject({
      commandId: 'update-object-stroke-line-style',
      control: 'stroke-line-style-segmented-control',
      id: 'strokeLineStyle',
      requiredAdapterSlot: 'command-effect',
    })
  })

  it('expresses unsupported state for objects without stroke', () => {
    expect(createSlideEditObjectStrokeLineStyleDescriptor({
      isSupported: false,
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'dash',
    })).toMatchObject({
      isSupported: false,
      metadata: {
        attributeValue: 'unsupported',
        isSupported: false,
        unsupportedReason: 'no-stroke',
        value: 'dash',
      },
      unsupportedReason: 'no-stroke',
    })
    expect(getSlideEditObjectStrokeLineStyleMetadata({
      isSupported: false,
      unsupportedReason: 'mixed-selection',
      value: 'dot',
    })).toMatchObject({
      attribute: 'data-slide-object-stroke-line-style',
      attributeValue: 'unsupported',
      isSupported: false,
      unsupportedReason: 'mixed-selection',
      value: 'dot',
    })
  })

  it('normalizes unknown line styles to solid', () => {
    expect(normalizeSlideEditObjectStrokeLineStyle('dash')).toBe('dash')
    expect(normalizeSlideEditObjectStrokeLineStyle('long-dash')).toBe('solid')
    expect(normalizeSlideEditObjectStrokeLineStyle(null)).toBe('solid')
    expect(isSlideEditObjectStrokeLineStyleValue('dot')).toBe(true)
    expect(isSlideEditObjectStrokeLineStyleValue('none')).toBe(false)
  })

  it('maps line styles to CSS border styles', () => {
    expect(getSlideEditObjectStrokeLineStyleBorderStyle('dash')).toBe('dashed')
    expect(getSlideEditObjectStrokeLineStyleBorderStyle('dot')).toBe('dotted')
    expect(getSlideEditObjectStrokeLineStyleBorderStyle('solid')).toBe('solid')
    expect(getSlideEditObjectStrokeLineStyleBorderStyle('long-dash')).toBe('solid')
  })

  it('maps line styles and stroke width to SVG dash arrays', () => {
    expect(getSlideEditObjectStrokeLineStyleDashArray({
      strokeWidth: 2,
      value: 'dash',
    })).toBe('6 4')
    expect(getSlideEditObjectStrokeLineStyleDashArray({
      strokeWidth: 2,
      value: 'dot',
    })).toBe('1 4')
    expect(getSlideEditObjectStrokeLineStyleDashArray({
      strokeWidth: 2,
      value: 'solid',
    })).toBeUndefined()
    expect(getSlideEditObjectStrokeLineStyleDashArray({
      strokeWidth: Number.NaN,
      value: 'dash',
    })).toBe('4 3')
  })

  it('routes selected object line style updates through host command effects', () => {
    expect(getSlideEditObjectStrokeLineStyleCommandEffect({
      fieldId: 'strokeLineStyle',
      id: 'update-object-stroke-line-style',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'dot',
    })).toEqual({
      payload: {
        fieldId: 'strokeLineStyle',
        id: 'update-object-stroke-line-style',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'dot',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('reads custom MIME direct line style before general JSON wrappers', () => {
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE]: '"dot"',
        'application/json': '{"strokeLineStyle":"dash"}',
      }),
    })).toBe('dot')
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE]: '"dash"',
      }),
    })).toBe('dash')
  })

  it('reads custom MIME line style wrappers', () => {
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE]:
          '{"value":"dash"}',
      }),
    })).toBe('dash')
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE]:
          '{"strokeLineStyle":"dot"}',
      }),
    })).toBe('dot')
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE]:
          '{"dash":true}',
      }),
    })).toBe('dash')
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_JSON_MIME_TYPE]:
          '{"strokeDash":false}',
      }),
    })).toBe('solid')
  })

  it('reads explicit line style wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"objectStrokeLineStyle":"dash"}',
      }),
    })).toBe('dash')
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"strokeLineStyle":"dot"}',
      }),
    })).toBe('dot')
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"strokeDash":true}',
      }),
    })).toBe('dash')
  })

  it('converts pasted line style into a host command', () => {
    expect(getSlideEditObjectStrokeLineStylePasteCommand({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'dot',
    })).toEqual({
      fieldId: 'strokeLineStyle',
      id: 'update-object-stroke-line-style',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'dot',
    })
  })

  it('ignores invalid, unrelated, and broad style JSON candidates', () => {
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"dash"',
      }),
    })).toBeNull()
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"strokeLineStyle":"long-dash"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"stroke":{"lineStyle":"dash"}}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectStrokeLineStyleJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"strokeDash":"6 4"}',
      }),
    })).toBeNull()
  })

  it('does not expose product names or canvas sample item names', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditObjectStrokeLineStyleDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'dash',
      }),
      field: SLIDE_EDIT_OBJECT_STROKE_LINE_STYLE_FIELD,
    }).toLowerCase()

    for (const blockedTerm of [
      'canvasitem',
      'engine-shape',
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

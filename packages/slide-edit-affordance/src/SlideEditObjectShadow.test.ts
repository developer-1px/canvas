import { describe, expect, it } from 'vitest'

import {
  createSlideEditObjectShadowDescriptor,
  getSlideEditObjectShadowCommandEffect,
  getSlideEditObjectShadowFilter,
  getSlideEditObjectShadowJSONPasteValue,
  getSlideEditObjectShadowMetadata,
  getSlideEditObjectShadowPasteCommands,
  normalizeSlideEditObjectShadow,
  normalizeSlideEditObjectShadowFieldValue,
  shouldEmitSlideEditObjectShadowMetadata,
  SLIDE_EDIT_OBJECT_SHADOW_DATA_ATTRIBUTE,
  SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
  SLIDE_EDIT_OBJECT_SHADOW_FIELDS,
  SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE,
  toSlideEditObjectShadowAttributeValue,
} from './SlideEditObjectShadow'
import {
  getSlideEditObjectShadowColorCSS as getSlideEditObjectShadowColorCSSFromPackage,
  getSlideEditObjectShadowFilter as getSlideEditObjectShadowFilterFromPackage,
  getSlideEditObjectShadowFilterCSS as getSlideEditObjectShadowFilterCSSFromPackage,
  getSlideEditObjectShadowJSONPasteValue as getSlideEditObjectShadowJSONPasteValueFromPackage,
} from './index'

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

    expect(getSlideEditObjectShadowFilterCSSFromPackage(shadow))
      .toBe('6.93px 4px 16px rgb(18 52 86 / 0.4)')
    expect(getSlideEditObjectShadowFilterFromPackage(shadow))
      .toBe('drop-shadow(6.93px 4px 16px rgb(18 52 86 / 0.4))')
  })

  it('omits disabled object shadow filters and preserves custom colors', () => {
    expect(getSlideEditObjectShadowFilter({
      enabled: false,
    })).toBeUndefined()
    expect(getSlideEditObjectShadowColorCSSFromPackage({
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

  it('reads custom MIME direct shadow values before general JSON wrappers', () => {
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE]: 'true',
        'application/json': '{"shadow":false}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'enabled',
          value: true,
        },
      ],
      shadow: {
        ...SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
        enabled: true,
      },
      surface: 'object-shadow',
    })
    expect(getSlideEditObjectShadowJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE]: 'false',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'enabled',
          value: false,
        },
      ],
    })
  })

  it('reads custom MIME shadow wrappers and normalizes object subsets', () => {
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE]:
          '{"value":{"enabled":true,"opacity":1.2,"blur":-4}}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'enabled',
          value: true,
        },
        {
          fieldId: 'opacity',
          value: 1,
        },
        {
          fieldId: 'blur',
          value: 0,
        },
      ],
      shadow: {
        ...SLIDE_EDIT_OBJECT_SHADOW_DEFAULT,
        blur: 0,
        enabled: true,
        opacity: 1,
      },
      surface: 'object-shadow',
    })
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE]:
          '{"shadow":{"color":" #123456 ","distance":1001}}',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'color',
          value: '#123456',
        },
        {
          fieldId: 'distance',
          value: 1000,
        },
      ],
    })
  })

  it('reads explicit object shadow wrappers from general JSON candidates', () => {
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"objectShadow":{"enabled":true}}',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'enabled',
          value: true,
        },
      ],
    })
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"objectEffectShadow":null}',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'enabled',
          value: false,
        },
      ],
    })
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"shadow":{"angle":390,"distance":8}}',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'angle',
          value: 360,
        },
        {
          fieldId: 'distance',
          value: 8,
        },
      ],
    })
  })

  it('converts paste values into object shadow update commands', () => {
    const pasteValue = getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"shadow":{"enabled":true,"blur":16}}',
      }),
    })

    expect(getSlideEditObjectShadowPasteCommands({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([
      {
        fieldId: 'enabled',
        id: 'update-object-shadow',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: true,
      },
      {
        fieldId: 'blur',
        id: 'update-object-shadow',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 16,
      },
    ])
    expect(getSlideEditObjectShadowCommandEffect(
      getSlideEditObjectShadowPasteCommands({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      })[0],
    ).type).toBe('slide-command-effect')
  })

  it('ignores invalid, unrelated, and CSS box-shadow JSON candidates', () => {
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"0 4px 12px rgb(0 0 0 / 0.2)"',
      }),
    })).toBeNull()
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"boxShadow":"0 4px 12px black"}',
      }),
    })).toBeNull()
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_OBJECT_SHADOW_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
    expect(getSlideEditObjectShadowJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'not json',
      }),
    })).toBeNull()
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

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (type: string) => values[type] ?? '',
  }
}

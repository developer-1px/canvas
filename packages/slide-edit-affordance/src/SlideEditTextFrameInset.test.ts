import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFrameInsetDescriptor,
  getSlideEditTextFrameInsetPaddingCSS,
  getSlideEditTextFrameInsetCommandEffect,
  getSlideEditTextFrameInsetJSONPasteValue,
  getSlideEditTextFrameInsetJSONPasteValueFromText,
  getSlideEditTextFrameInsetJSONPasteValueFromValue,
  getSlideEditTextFrameInsetMetadata,
  getSlideEditTextFrameInsetPasteCommands,
  normalizeSlideEditTextFrameInset,
  normalizeSlideEditTextFrameInsetValue,
  SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
  SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
  SLIDE_EDIT_TEXT_FRAME_INSET_JSON_MIME_TYPE,
  SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS,
  toSlideEditTextFrameInsetAttributeValue,
} from './SlideEditTextFrameInset'
import {
  getSlideEditTextFrameInsetJSONPasteValue as getSlideEditTextFrameInsetJSONPasteValueFromPackage,
  getSlideEditTextFrameInsetJSONPasteValueFromText as getSlideEditTextFrameInsetJSONPasteValueFromTextFromPackage,
  getSlideEditTextFrameInsetJSONPasteValueFromValue as getSlideEditTextFrameInsetJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditTextFrameInset', () => {
  it('creates a text frame inset descriptor with zero defaults', () => {
    expect(createSlideEditTextFrameInsetDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
      inset: SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
      metadata: {
        attribute: SLIDE_EDIT_TEXT_FRAME_INSET_DATA_ATTRIBUTE,
        defaultValue: '0 0 0 0',
        inset: SLIDE_EDIT_TEXT_FRAME_INSET_DEFAULT,
        value: '0 0 0 0',
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-frame-inset',
    })
  })

  it('documents the four inset fields and metadata attribute value order', () => {
    expect(SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS.map((field) => field.id))
      .toEqual([
        'top',
        'right',
        'bottom',
        'left',
      ])
    expect(toSlideEditTextFrameInsetAttributeValue({
      bottom: 3,
      left: 4,
      right: 2,
      top: 1,
    })).toBe('1 2 3 4')
    expect(getSlideEditTextFrameInsetMetadata({
      bottom: 3,
      left: 4,
      right: 2,
      top: 1,
    }).attribute).toBe('data-slide-text-frame-inset')
  })

  it('formats normalized inset as CSS padding in metadata order', () => {
    expect(getSlideEditTextFrameInsetPaddingCSS({
      bottom: 3,
      left: 4,
      right: 2,
      top: 1,
    })).toBe('1px 2px 3px 4px')
    expect(getSlideEditTextFrameInsetPaddingCSS({
      bottom: Number.POSITIVE_INFINITY,
      left: 5.678,
      right: -2,
      top: 1,
    })).toBe('1px 0px 0px 5.68px')
  })

  it('normalizes inset numeric boundaries before host application', () => {
    expect(normalizeSlideEditTextFrameInsetValue(Number.NaN)).toBe(0)
    expect(normalizeSlideEditTextFrameInsetValue(-12)).toBe(0)
    expect(normalizeSlideEditTextFrameInsetValue(12.345)).toBe(12.35)
    expect(normalizeSlideEditTextFrameInsetValue(
      SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max + 1,
    )).toBe(SLIDE_EDIT_TEXT_FRAME_INSET_LIMITS.max)

    expect(normalizeSlideEditTextFrameInset({
      bottom: Number.POSITIVE_INFINITY,
      left: 5.678,
      right: -2,
      top: 1,
    })).toEqual({
      bottom: 0,
      left: 5.68,
      right: 0,
      top: 1,
    })
  })

  it('routes selected text object inset changes through host command effects', () => {
    expect(getSlideEditTextFrameInsetCommandEffect({
      fieldId: 'left',
      id: 'update-text-frame-inset',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 8.5,
    })).toEqual({
      payload: {
        fieldId: 'left',
        id: 'update-text-frame-inset',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 8.5,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditTextFrameInsetCommandEffect({
      fieldId: 'top',
      id: 'update-text-frame-inset',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: -4,
    }).payload.value).toBe(0)
  })

  it('reads custom MIME direct text frame inset JSON values first', () => {
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FRAME_INSET_JSON_MIME_TYPE]: JSON.stringify({
          bottom: 16,
          left: 20,
          right: 12,
          top: 8,
        }),
        'application/json': '{"textFrameInset":4}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'top',
          value: 8,
        },
        {
          fieldId: 'right',
          value: 12,
        },
        {
          fieldId: 'bottom',
          value: 16,
        },
        {
          fieldId: 'left',
          value: 20,
        },
      ],
      inset: {
        bottom: 16,
        left: 20,
        right: 12,
        top: 8,
      },
      surface: 'text-frame-inset',
    })
    expect(getSlideEditTextFrameInsetJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FRAME_INSET_JSON_MIME_TYPE]: '6',
      }),
    })).toMatchObject({
      inset: {
        bottom: 6,
        left: 6,
        right: 6,
        top: 6,
      },
    })
  })

  it('reads explicit text frame inset wrappers from general JSON candidates', () => {
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"textFrameInset":{"top":8}}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'top',
          value: 8,
        },
      ],
      inset: {
        top: 8,
      },
      surface: 'text-frame-inset',
    })
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"textPadding":[1,2,"bad",4]}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'top',
          value: 1,
        },
        {
          fieldId: 'right',
          value: 2,
        },
        {
          fieldId: 'left',
          value: 4,
        },
      ],
      inset: {
        left: 4,
        right: 2,
        top: 1,
      },
      surface: 'text-frame-inset',
    })
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"padding":"10px"}',
      }),
    })).toMatchObject({
      inset: {
        bottom: 10,
        left: 10,
        right: 10,
        top: 10,
      },
    })
  })

  it('reads text frame inset JSON from text and parsed values', () => {
    expect(getSlideEditTextFrameInsetJSONPasteValueFromText(
      JSON.stringify({
        bottom: 16,
        left: 20,
        right: 12,
        top: 8,
      }),
    )).toMatchObject({
      inset: {
        bottom: 16,
        left: 20,
        right: 12,
        top: 8,
      },
    })
    expect(getSlideEditTextFrameInsetJSONPasteValueFromValue(6)).toMatchObject({
      inset: {
        bottom: 6,
        left: 6,
        right: 6,
        top: 6,
      },
    })
    expect(getSlideEditTextFrameInsetJSONPasteValueFromTextFromPackage(
      '{"textPadding":[1,2,"bad",4]}',
      { mode: 'wrapped' },
    )).toEqual({
      fields: [
        {
          fieldId: 'top',
          value: 1,
        },
        {
          fieldId: 'right',
          value: 2,
        },
        {
          fieldId: 'left',
          value: 4,
        },
      ],
      inset: {
        left: 4,
        right: 2,
        top: 1,
      },
      surface: 'text-frame-inset',
    })
    expect(getSlideEditTextFrameInsetJSONPasteValueFromValueFromPackage(
      {
        padding: '10px',
      },
      { mode: 'wrapped' },
    )).toMatchObject({
      inset: {
        bottom: 10,
        left: 10,
        right: 10,
        top: 10,
      },
    })
  })

  it('converts text frame inset paste values into host commands', () => {
    const pasteValue = getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"inset":[1,2,3,4]}',
      }),
    })

    expect(getSlideEditTextFrameInsetPasteCommands({
      objectIds: ['object-a'],
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([
      {
        fieldId: 'top',
        id: 'update-text-frame-inset',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 1,
      },
      {
        fieldId: 'right',
        id: 'update-text-frame-inset',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 2,
      },
      {
        fieldId: 'bottom',
        id: 'update-text-frame-inset',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 3,
      },
      {
        fieldId: 'left',
        id: 'update-text-frame-inset',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 4,
      },
    ])
    expect(getSlideEditTextFrameInsetCommandEffect(
      getSlideEditTextFrameInsetPasteCommands({
        objectIds: ['object-a'],
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      })[0],
    ).type).toBe('slide-command-effect')
    expect(getSlideEditTextFrameInsetPasteCommands({
      objectIds: [],
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([])
  })

  it('ignores invalid, unrelated, and direct generic text frame inset JSON', () => {
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"top":8}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"padding":{}}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"padding":["bad"]}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"unrelated":8}',
      }),
    })).toBeNull()
    expect(getSlideEditTextFrameInsetJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_FRAME_INSET_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextFrameInsetDescriptor({
        inset: {
          bottom: 10,
          left: 4,
          right: 4,
          top: 10,
        },
        objectId: 'object-a',
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_TEXT_FRAME_INSET_FIELDS,
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

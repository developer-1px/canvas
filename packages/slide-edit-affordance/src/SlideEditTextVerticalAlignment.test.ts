import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextVerticalAlignmentDescriptor,
  getSlideEditTextVerticalAlignmentCommandEffect,
  getSlideEditTextVerticalAlignmentFlexAlignItems,
  getSlideEditTextVerticalAlignmentJSONPasteValue,
  getSlideEditTextVerticalAlignmentMetadata,
  getSlideEditTextVerticalAlignmentPasteCommands,
  normalizeSlideEditTextVerticalAlignment,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_MIME_TYPE,
  SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
} from './SlideEditTextVerticalAlignment'
import {
  getSlideEditTextVerticalAlignmentJSONPasteValue as getSlideEditTextVerticalAlignmentJSONPasteValueFromPackage,
} from './index'

describe('SlideEditTextVerticalAlignment', () => {
  it('creates a text vertical alignment descriptor with top as default', () => {
    expect(createSlideEditTextVerticalAlignmentDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
      metadata: {
        attribute: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DATA_ATTRIBUTE,
        defaultValue: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_DEFAULT,
        value: 'top',
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-vertical-alignment',
      value: 'top',
    })
  })

  it('documents the allowed alignment values and metadata attribute', () => {
    expect(SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS.map((option) =>
      option.id
    )).toEqual([
      'top',
      'middle',
      'bottom',
    ])
    expect(getSlideEditTextVerticalAlignmentMetadata('middle')).toEqual({
      attribute: 'data-slide-text-vertical-align',
      defaultValue: 'top',
      value: 'middle',
    })
  })

  it('normalizes unknown values to top', () => {
    expect(normalizeSlideEditTextVerticalAlignment('bottom')).toBe('bottom')
    expect(normalizeSlideEditTextVerticalAlignment('center')).toBe('top')
    expect(normalizeSlideEditTextVerticalAlignment(null)).toBe('top')
  })

  it('maps normalized alignment values to flex align-items CSS', () => {
    expect(getSlideEditTextVerticalAlignmentFlexAlignItems('top'))
      .toBe('flex-start')
    expect(getSlideEditTextVerticalAlignmentFlexAlignItems('middle'))
      .toBe('center')
    expect(getSlideEditTextVerticalAlignmentFlexAlignItems('bottom'))
      .toBe('flex-end')
    expect(getSlideEditTextVerticalAlignmentFlexAlignItems('center'))
      .toBe('flex-start')
  })

  it('routes selected text object alignment updates through host command effects', () => {
    expect(getSlideEditTextVerticalAlignmentCommandEffect({
      fieldId: 'verticalAlignment',
      id: 'update-text-vertical-alignment',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'middle',
    })).toEqual({
      payload: {
        fieldId: 'verticalAlignment',
        id: 'update-text-vertical-alignment',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'middle',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('reads custom MIME direct vertical alignment JSON values first', () => {
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_MIME_TYPE]: '"bottom"',
        'application/json': '{"textVerticalAlign":"top"}',
      }),
    })).toEqual({
      surface: 'text-vertical-alignment',
      value: 'bottom',
    })
    expect(getSlideEditTextVerticalAlignmentJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_MIME_TYPE]:
          '{"value":"flex-end"}',
      }),
    })).toEqual({
      surface: 'text-vertical-alignment',
      value: 'bottom',
    })
  })

  it('reads explicit vertical alignment keys from general JSON candidates', () => {
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"textVerticalAlign":"bottom"}',
      }),
    })).toEqual({
      surface: 'text-vertical-alignment',
      value: 'bottom',
    })
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"alignItems":"center"}',
      }),
    })).toEqual({
      surface: 'text-vertical-alignment',
      value: 'middle',
    })
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"verticalAlignment":"flex-start"}',
      }),
    })).toEqual({
      surface: 'text-vertical-alignment',
      value: 'top',
    })
  })

  it('converts vertical alignment paste values into host commands', () => {
    const pasteValue = getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"alignItems":"flex-end"}',
      }),
    })

    expect(getSlideEditTextVerticalAlignmentPasteCommands({
      objectIds: [
        'object-a',
        'object-b',
      ],
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([
      {
        fieldId: 'verticalAlignment',
        id: 'update-text-vertical-alignment',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'bottom',
      },
      {
        fieldId: 'verticalAlignment',
        id: 'update-text-vertical-alignment',
        objectId: 'object-b',
        slideId: 'slide-a',
        value: 'bottom',
      },
    ])
    expect(getSlideEditTextVerticalAlignmentCommandEffect(
      getSlideEditTextVerticalAlignmentPasteCommands({
        objectIds: ['object-a'],
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      })[0],
    ).type).toBe('slide-command-effect')
    expect(getSlideEditTextVerticalAlignmentPasteCommands({
      objectIds: [],
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([])
  })

  it('ignores invalid, unrelated, and direct generic vertical alignment JSON', () => {
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"bottom"',
      }),
    })).toBeNull()
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"value":"bottom"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"textAlign":"bottom"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"verticalAlignment":"baseline"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextVerticalAlignmentJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextVerticalAlignmentDescriptor({
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'bottom',
      }),
      field: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_FIELD,
      options: SLIDE_EDIT_TEXT_VERTICAL_ALIGNMENT_OPTIONS,
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

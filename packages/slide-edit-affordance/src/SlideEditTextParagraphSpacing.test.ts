import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphBulletDescriptor,
  createSlideEditTextParagraphSpacingDescriptor,
  getSlideEditTextParagraphBulletCommandEffect,
  getSlideEditTextParagraphBulletJSONPasteValue,
  getSlideEditTextParagraphBulletJSONPasteValueFromText,
  getSlideEditTextParagraphBulletJSONPasteValueFromValue,
  getSlideEditTextParagraphBulletKeyboardIntent,
  getSlideEditTextParagraphSpacingCommandEffect,
  getSlideEditTextParagraphSpacingCSSStyle,
  getSlideEditTextParagraphSpacingJSONPasteValue,
  getSlideEditTextParagraphSpacingJSONPasteValueFromText,
  getSlideEditTextParagraphSpacingJSONPasteValueFromValue,
  getSlideEditTextParagraphSpacingPasteCommands,
  normalizeSlideEditTextParagraphBulletValue,
  normalizeSlideEditTextLineHeightRatio,
  normalizeSlideEditTextParagraphSpacingAmount,
  normalizeSlideEditTextParagraphSpacingNumber,
  SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING,
  SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
  SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD,
  SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_SHORTCUT,
  SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_VALUES,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_MIME_TYPE,
  SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS,
} from './SlideEditTextParagraphSpacing'
import {
  createSlideEditTextParagraphBulletDescriptor as createSlideEditTextParagraphBulletDescriptorFromPackage,
  getSlideEditTextParagraphBulletJSONPasteValueFromText as getSlideEditTextParagraphBulletJSONPasteValueFromTextFromPackage,
  getSlideEditTextParagraphBulletJSONPasteValueFromValue as getSlideEditTextParagraphBulletJSONPasteValueFromValueFromPackage,
  getSlideEditTextParagraphBulletKeyboardIntent as getSlideEditTextParagraphBulletKeyboardIntentFromPackage,
  getSlideEditTextParagraphSpacingJSONPasteValue as getSlideEditTextParagraphSpacingJSONPasteValueFromPackage,
  getSlideEditTextParagraphSpacingJSONPasteValueFromText as getSlideEditTextParagraphSpacingJSONPasteValueFromTextFromPackage,
  getSlideEditTextParagraphSpacingJSONPasteValueFromValue as getSlideEditTextParagraphSpacingJSONPasteValueFromValueFromPackage,
} from './index'

describe('SlideEditTextParagraphSpacing', () => {
  it('creates a product-neutral text paragraph spacing descriptor', () => {
    expect(createSlideEditTextParagraphSpacingDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      fields: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-spacing',
      values: SLIDE_EDIT_DEFAULT_TEXT_PARAGRAPH_SPACING,
    })
  })

  it('provides line height and paragraph before/after field descriptors', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS.map((field) =>
      field.id
    )).toEqual([
      'lineHeightRatio',
      'paragraphBefore',
      'paragraphAfter',
    ])
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS.map((field) =>
      field.commandId
    )).toEqual([
      'update-text-paragraph-spacing',
      'update-text-paragraph-spacing',
      'update-text-paragraph-spacing',
    ])
  })

  it('creates a product-neutral text paragraph bullet descriptor', () => {
    expect(createSlideEditTextParagraphBulletDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-bullet',
      value: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_DEFAULT,
    })
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_VALUES).toEqual([
      'none',
      'bullet',
      'numbered',
    ])
    expect(createSlideEditTextParagraphBulletDescriptorFromPackage({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'bullet',
    })).toMatchObject({
      surface: 'text-paragraph-bullet',
      value: 'bullet',
    })
  })

  it('normalizes paragraph bullet values and rejects invalid values', () => {
    expect(normalizeSlideEditTextParagraphBulletValue('bullet')).toBe('bullet')
    expect(normalizeSlideEditTextParagraphBulletValue('numbered')).toBe(
      'numbered',
    )
    expect(normalizeSlideEditTextParagraphBulletValue('none')).toBe('none')
    expect(normalizeSlideEditTextParagraphBulletValue('ordered')).toBeNull()
    expect(normalizeSlideEditTextParagraphBulletValue(true)).toBeNull()
    expect(normalizeSlideEditTextParagraphBulletValue(null)).toBeNull()
  })

  it('routes paragraph bullet updates through host command effects', () => {
    expect(getSlideEditTextParagraphBulletCommandEffect({
      fieldId: 'paragraphBullet',
      id: 'update-text-paragraph-bullet',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'numbered',
    })).toEqual({
      payload: {
        fieldId: 'paragraphBullet',
        id: 'update-text-paragraph-bullet',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 'numbered',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('maps paragraph bullet keyboard shortcut to a host toggle intent', () => {
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      key: 'L',
      mod: true,
      shiftKey: true,
    })).toEqual({
      commandId: 'toggle-text-paragraph-bullet',
      kind: 'toggle-bullet',
      preventDefault: true,
      shortcut: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_KEYBOARD_SHORTCUT,
      value: 'bullet',
    })
    expect(getSlideEditTextParagraphBulletKeyboardIntentFromPackage({
      key: 'l',
      mod: true,
      shiftKey: true,
    })).toMatchObject({
      kind: 'toggle-bullet',
      shortcut: 'Cmd/Ctrl+Shift+L',
      value: 'bullet',
    })
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      key: 'l',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      altKey: true,
      key: 'l',
      mod: true,
      shiftKey: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      key: 'x',
      mod: true,
      shiftKey: true,
    })).toBeNull()
  })

  it('reads custom MIME direct paragraph bullet JSON values', () => {
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD.jsonMimeType]: '"bullet"',
        'text/json': '{"paragraphBullet":"numbered"}',
        'text/plain': 'ignored',
      }),
    })).toBe('bullet')
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD.jsonMimeType]: '"none"',
      }),
    })).toBe('none')
  })

  it('reads explicit paragraph bullet fields from general JSON payloads', () => {
    for (const [payload, expected] of [
      [{ paragraphBullet: 'bullet' }, 'bullet'],
      [{ textParagraphBullet: 'numbered' }, 'numbered'],
      [{ bullet: 'bullet' }, 'bullet'],
      [{ list: 'numbered' }, 'numbered'],
      [{ value: 'none' }, 'none'],
    ] as const) {
      expect(getSlideEditTextParagraphBulletJSONPasteValue({
        dataTransfer: createDataTransfer({
          'text/plain': JSON.stringify(payload),
        }),
      })).toBe(expected)
    }
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"textParagraphBullet":"bullet"}',
      }),
    })).toBe('bullet')
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '{"paragraphBullet":"bullet"}',
      }),
    })).toBe('bullet')
  })

  it('reads paragraph bullet JSON from text and parsed values', () => {
    expect(getSlideEditTextParagraphBulletJSONPasteValueFromText('"bullet"'))
      .toBe('bullet')
    expect(getSlideEditTextParagraphBulletJSONPasteValueFromValue({
      paragraphBullet: 'numbered',
    }, { mode: 'wrapped' })).toBe('numbered')
    expect(getSlideEditTextParagraphBulletJSONPasteValueFromTextFromPackage(
      '{"value":"none"}',
      { mode: 'wrapped' },
    )).toBe('none')
    expect(getSlideEditTextParagraphBulletJSONPasteValueFromValueFromPackage(
      'bullet',
    )).toBe('bullet')
    expect(getSlideEditTextParagraphBulletJSONPasteValueFromText(
      '"bullet"',
      { mode: 'wrapped' },
    )).toBeNull()
  })

  it('does not treat generic text/plain direct values as paragraph bullet', () => {
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '"bullet"',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': 'bullet',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"bullet":true}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"list":"ordered"}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json': '"bullet"',
      }),
    })).toBeNull()
  })

  it('routes field updates through host command effects', () => {
    expect(getSlideEditTextParagraphSpacingCommandEffect({
      fieldId: 'lineHeightRatio',
      id: 'update-text-paragraph-spacing',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 1.25,
    })).toEqual({
      payload: {
        fieldId: 'lineHeightRatio',
        id: 'update-text-paragraph-spacing',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 1.25,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })

    expect(getSlideEditTextParagraphSpacingCommandEffect({
      fieldId: 'paragraphBefore',
      id: 'update-text-paragraph-spacing',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: {
        unit: 'slide-unit',
        value: -10,
      },
    }).payload.value).toEqual({
      unit: 'slide-unit',
      value: 0,
    })
  })

  it('reads custom MIME direct paragraph spacing JSON values first', () => {
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_MIME_TYPE]: JSON.stringify({
          lineHeightRatio: '1.234',
          spacingAfter: {
            unit: 'slide-unit',
            value: 1001,
          },
          spacingBefore: '12px',
        }),
        'application/json': '{"paragraphSpacing":{"lineHeight":3}}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'lineHeightRatio',
          value: 1.23,
        },
        {
          fieldId: 'paragraphBefore',
          value: {
            unit: 'px',
            value: 12,
          },
        },
        {
          fieldId: 'paragraphAfter',
          value: {
            unit: 'slide-unit',
            value: 1000,
          },
        },
      ],
      surface: 'text-paragraph-spacing',
      values: {
        lineHeightRatio: 1.23,
        paragraphAfter: {
          unit: 'slide-unit',
          value: 1000,
        },
        paragraphBefore: {
          unit: 'px',
          value: 12,
        },
      },
    })
    expect(getSlideEditTextParagraphSpacingJSONPasteValueFromPackage({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_MIME_TYPE]: JSON.stringify({
          after: '8px',
          before: '4px',
          lineHeight: 1.5,
        }),
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'lineHeightRatio',
          value: 1.5,
        },
        {
          fieldId: 'paragraphBefore',
          value: {
            value: 4,
          },
        },
        {
          fieldId: 'paragraphAfter',
          value: {
            value: 8,
          },
        },
      ],
    })
  })

  it('reads explicit paragraph spacing wrappers from general JSON candidates', () => {
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json':
          '{"textParagraphSpacing":{"lineHeight":0.1}}',
      }),
    })).toEqual({
      fields: [
        {
          fieldId: 'lineHeightRatio',
          value: 0.5,
        },
      ],
      surface: 'text-paragraph-spacing',
      values: {
        lineHeightRatio: 0.5,
      },
    })
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/json':
          '{"paragraphStyle":{"marginTop":"8px","marginBottom":"10"}}',
      }),
    })).toMatchObject({
      fields: [
        {
          fieldId: 'paragraphBefore',
          value: {
            unit: 'px',
            value: 8,
          },
        },
        {
          fieldId: 'paragraphAfter',
          value: {
            unit: 'px',
            value: 10,
          },
        },
      ],
    })
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"spacing":{"paragraphAfter":{"value":12}}}',
      }),
    })).toMatchObject({
      values: {
        paragraphAfter: {
          unit: 'px',
          value: 12,
        },
      },
    })
  })

  it('reads paragraph spacing JSON from text and parsed values', () => {
    expect(getSlideEditTextParagraphSpacingJSONPasteValueFromText(
      JSON.stringify({
        lineHeightRatio: '1.234',
        spacingAfter: {
          unit: 'slide-unit',
          value: 1001,
        },
        spacingBefore: '12px',
      }),
    )).toMatchObject({
      fields: [
        {
          fieldId: 'lineHeightRatio',
          value: 1.23,
        },
        {
          fieldId: 'paragraphBefore',
          value: {
            unit: 'px',
            value: 12,
          },
        },
        {
          fieldId: 'paragraphAfter',
          value: {
            unit: 'slide-unit',
            value: 1000,
          },
        },
      ],
      values: {
        lineHeightRatio: 1.23,
      },
    })
    expect(getSlideEditTextParagraphSpacingJSONPasteValueFromValue({
      after: '8px',
      before: '4px',
      lineHeight: 1.5,
    })).toMatchObject({
      values: {
        lineHeightRatio: 1.5,
        paragraphAfter: {
          value: 8,
        },
        paragraphBefore: {
          value: 4,
        },
      },
    })
    expect(getSlideEditTextParagraphSpacingJSONPasteValueFromTextFromPackage(
      '{"paragraphStyle":{"marginTop":"8px","marginBottom":"10"}}',
      { mode: 'wrapped' },
    )).toMatchObject({
      fields: [
        {
          fieldId: 'paragraphBefore',
          value: {
            unit: 'px',
            value: 8,
          },
        },
        {
          fieldId: 'paragraphAfter',
          value: {
            unit: 'px',
            value: 10,
          },
        },
      ],
    })
    expect(getSlideEditTextParagraphSpacingJSONPasteValueFromValueFromPackage(
      {
        spacing: {
          lineHeight: 0.1,
        },
      },
      { mode: 'wrapped' },
    )).toEqual({
      fields: [
        {
          fieldId: 'lineHeightRatio',
          value: 0.5,
        },
      ],
      surface: 'text-paragraph-spacing',
      values: {
        lineHeightRatio: 0.5,
      },
    })
  })

  it('converts paragraph spacing paste values into host commands', () => {
    const pasteValue = getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': JSON.stringify({
          paragraphSpacing: {
            after: 8,
            before: 4,
            lineHeight: 1.25,
          },
        }),
      }),
    })

    expect(getSlideEditTextParagraphSpacingPasteCommands({
      objectId: 'object-a',
      pasteValue: pasteValue!,
      slideId: 'slide-a',
    })).toEqual([
      {
        fieldId: 'lineHeightRatio',
        id: 'update-text-paragraph-spacing',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 1.25,
      },
      {
        fieldId: 'paragraphBefore',
        id: 'update-text-paragraph-spacing',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: {
          unit: 'px',
          value: 4,
        },
      },
      {
        fieldId: 'paragraphAfter',
        id: 'update-text-paragraph-spacing',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: {
          unit: 'px',
          value: 8,
        },
      },
    ])
    expect(getSlideEditTextParagraphSpacingCommandEffect(
      getSlideEditTextParagraphSpacingPasteCommands({
        objectId: 'object-a',
        pasteValue: pasteValue!,
        slideId: 'slide-a',
      })[0],
    ).type).toBe('slide-command-effect')
  })

  it('ignores invalid, unrelated, and direct generic paragraph spacing JSON', () => {
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: null,
    })).toBeNull()
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"lineHeight":1.2}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"paragraphSpacing":{}}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"paragraphSpacing":{"lineHeight":"wide"}}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        'text/plain': '{"paragraphSpacing":{"list":"bullet"}}',
      }),
    })).toBeNull()
    expect(getSlideEditTextParagraphSpacingJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_JSON_MIME_TYPE]: 'not json',
      }),
    })).toBeNull()
  })

  it('normalizes numeric boundaries before host application', () => {
    expect(normalizeSlideEditTextLineHeightRatio(Number.NaN)).toBe(1)
    expect(normalizeSlideEditTextLineHeightRatio(0.1)).toBe(
      SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.minLineHeightRatio,
    )
    expect(normalizeSlideEditTextLineHeightRatio(4.5)).toBe(
      SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_LIMITS.maxLineHeightRatio,
    )
    expect(normalizeSlideEditTextLineHeightRatio(1.234)).toBe(1.23)

    expect(normalizeSlideEditTextParagraphSpacingAmount({
      unit: 'slide-unit',
      value: 12.345,
    })).toEqual({
      unit: 'slide-unit',
      value: 12.35,
    })
    expect(normalizeSlideEditTextParagraphSpacingAmount({
      unit: 'px',
      value: Number.POSITIVE_INFINITY,
    })).toEqual({
      unit: 'px',
      value: 0,
    })
    expect(normalizeSlideEditTextParagraphSpacingNumber({
      fallback: 2,
      max: 10,
      min: 0,
      precision: 1,
      value: 10.49,
    })).toBe(10)
  })

  it('formats normalized paragraph spacing values for CSS rendering', () => {
    expect(getSlideEditTextParagraphSpacingCSSStyle({
      lineHeightRatio: 1.234,
      paragraphAfter: {
        unit: 'px',
        value: 8.126,
      },
      paragraphBefore: {
        unit: 'slide-unit',
        value: 4.234,
      },
    })).toEqual({
      lineHeight: 1.23,
      marginBottom: '8.13px',
      marginTop: '4.23px',
    })

    expect(getSlideEditTextParagraphSpacingCSSStyle(null)).toEqual({
      lineHeight: 1,
      marginBottom: '0px',
      marginTop: '0px',
    })
  })

  it('does not expose product names or host storage names in runtime strings', () => {
    const publicStrings = JSON.stringify({
      descriptor: createSlideEditTextParagraphSpacingDescriptor({
        lineHeightRatio: 1.2,
        objectId: 'object-a',
        paragraphAfter: {
          unit: 'px',
          value: 8,
        },
        paragraphBefore: {
          unit: 'slide-unit',
          value: 4,
        },
        slideId: 'slide-a',
      }),
      fields: SLIDE_EDIT_TEXT_PARAGRAPH_SPACING_FIELDS,
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

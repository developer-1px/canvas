import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphListLevelDescriptor,
  getSlideEditTextParagraphListLevelCommandEffect,
  getSlideEditTextParagraphListLevelIndentCSSValue,
  getSlideEditTextParagraphListLevelJSONPasteValue,
  getSlideEditTextParagraphListLevelJSONPasteValueFromText,
  getSlideEditTextParagraphListLevelJSONPasteValueFromValue,
  getSlideEditTextParagraphListLevelKeyboardIntent,
  getSlideEditTextParagraphListLevelModelValue,
  normalizeSlideEditTextParagraphListLevel,
  normalizeSlideEditTextParagraphListLevelCommand,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_DECREASE_KEYBOARD_SHORTCUT,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_INCREASE_KEYBOARD_SHORTCUT,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_MIME_TYPE,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_KEYS,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_ROUTING_PRIORITY,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS,
} from './SlideEditTextParagraphListLevel'
import {
  createSlideEditTextParagraphListLevelDescriptor as createSlideEditTextParagraphListLevelDescriptorFromPackage,
  getSlideEditTextParagraphListLevelJSONPasteValueFromValue as getSlideEditTextParagraphListLevelJSONPasteValueFromValueFromPackage,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD as SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD_FROM_PACKAGE,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL as SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL_FROM_PACKAGE,
} from './index'

describe('SlideEditTextParagraphListLevel', () => {
  it('creates a product-neutral paragraph list level descriptor', () => {
    expect(createSlideEditTextParagraphListLevelDescriptor({
      level: 2,
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toEqual({
      canDecrease: true,
      canIncrease: true,
      field: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD,
      indent: {
        cssValue: '2.7em',
        em: 2.7,
      },
      level: 2,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-list-level',
    })
    expect(createSlideEditTextParagraphListLevelDescriptorFromPackage({
      level: 0,
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toMatchObject({
      canDecrease: false,
      canIncrease: true,
      level: 0,
      surface: 'text-paragraph-list-level',
    })
  })

  it('defines level bounds, field metadata, and keyboard metadata', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_LIMITS).toEqual({
      indentEm: 1.35,
      max: 5,
      min: 0,
      step: 1,
    })
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD).toMatchObject({
      commandIds: {
        decrease: 'decrease-text-paragraph-list-level',
        increase: 'increase-text-paragraph-list-level',
        set: 'set-text-paragraph-list-level',
      },
      control: 'paragraph-list-level-stepper',
      id: 'paragraphListLevel',
      jsonKeys: [
        'paragraphLevel',
        'paragraphListLevel',
        'textParagraphListLevel',
        'listLevel',
        'indentLevel',
        'level',
        'value',
      ],
      max: 5,
      min: 0,
      step: 1,
      unit: 'level',
    })
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_INCREASE_KEYBOARD_SHORTCUT)
      .toBe('Tab')
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_DECREASE_KEYBOARD_SHORTCUT)
      .toBe('Shift+Tab')
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_KEYS)
      .toBe('Tab Shift+Tab')
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL).toBe(
      'slide-edit-text-paragraph-list-level-keyboard-shortcuts',
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT).toBe(
      'slide-edit-text-paragraph-list-level-keyboard-intent',
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_ROUTING_PRIORITY).toBe(
      'text-edit-before-focus-navigation',
    )
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD)
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL_FROM_PACKAGE)
      .toBe(SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_MODEL)
  })

  it('normalizes list levels and model values', () => {
    expect(normalizeSlideEditTextParagraphListLevel(undefined)).toBe(0)
    expect(normalizeSlideEditTextParagraphListLevel(-1)).toBe(0)
    expect(normalizeSlideEditTextParagraphListLevel(1.6)).toBe(2)
    expect(normalizeSlideEditTextParagraphListLevel('3')).toBe(3)
    expect(normalizeSlideEditTextParagraphListLevel(99)).toBe(5)
    expect(getSlideEditTextParagraphListLevelModelValue(0)).toBeUndefined()
    expect(getSlideEditTextParagraphListLevelModelValue(2)).toBe(2)
    expect(getSlideEditTextParagraphListLevelIndentCSSValue(3)).toBe('4.05em')
  })

  it('routes set and step commands through host command effects', () => {
    expect(getSlideEditTextParagraphListLevelCommandEffect({
      fieldId: 'paragraphListLevel',
      id: 'set-text-paragraph-list-level',
      kind: 'set-list-level',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 8,
    })).toEqual({
      payload: {
        fieldId: 'paragraphListLevel',
        id: 'set-text-paragraph-list-level',
        kind: 'set-list-level',
        objectId: 'object-a',
        slideId: 'slide-a',
        value: 5,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(normalizeSlideEditTextParagraphListLevelCommand({
      delta: 5 as 1,
      fieldId: 'paragraphListLevel',
      id: 'increase-text-paragraph-list-level',
      kind: 'increase-list-level',
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toMatchObject({
      delta: 1,
      id: 'increase-text-paragraph-list-level',
      kind: 'increase-list-level',
    })
    expect(normalizeSlideEditTextParagraphListLevelCommand({
      delta: 1 as -1,
      fieldId: 'paragraphListLevel',
      id: 'decrease-text-paragraph-list-level',
      kind: 'decrease-list-level',
      objectId: 'object-a',
      slideId: 'slide-a',
    })).toMatchObject({
      delta: -1,
      id: 'decrease-text-paragraph-list-level',
      kind: 'decrease-list-level',
    })
  })

  it('maps Tab and Shift Tab to separated keyboard intents', () => {
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'Tab',
    })).toEqual({
      commandId: 'increase-text-paragraph-list-level',
      delta: 1,
      intent: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT,
      kind: 'increase-list-level',
      preventDefault: true,
      shortcut: 'Tab',
    })
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'Tab',
      shiftKey: true,
    })).toEqual({
      commandId: 'decrease-text-paragraph-list-level',
      delta: -1,
      intent: SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_KEYBOARD_INTENT,
      kind: 'decrease-list-level',
      preventDefault: true,
      shortcut: 'Shift+Tab',
    })
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'Tab',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      altKey: true,
      key: 'Tab',
    })).toBeNull()
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'ArrowRight',
    })).toBeNull()
  })

  it('reads custom MIME and generic JSON list level values', () => {
    expect(getSlideEditTextParagraphListLevelJSONPasteValue({
      dataTransfer: createDataTransfer({
        [SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_JSON_MIME_TYPE]: '2',
        'text/plain': '{"paragraphLevel":4}',
      }),
    })).toBe(2)
    expect(getSlideEditTextParagraphListLevelJSONPasteValue({
      dataTransfer: createDataTransfer({
        'application/json': '{"paragraphLevel":1}',
      }),
    })).toBe(1)
    expect(getSlideEditTextParagraphListLevelJSONPasteValueFromText(
      '{"paragraph":{"indentLevel":"3"}}',
      { mode: 'wrapped' },
    )).toBe(3)
    expect(getSlideEditTextParagraphListLevelJSONPasteValueFromValue({
      listLevel: 2.5,
    })).toBe(3)
    expect(getSlideEditTextParagraphListLevelJSONPasteValueFromValueFromPackage({
      level: 9,
    })).toBe(5)
    expect(getSlideEditTextParagraphListLevelJSONPasteValueFromValue({
      unrelated: 2,
    })).toBeNull()
  })
})

function createDataTransfer(values: Record<string, string>) {
  return {
    getData(type: string) {
      return values[type] ?? ''
    },
  }
}

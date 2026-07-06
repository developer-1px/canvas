import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphListLevelDescriptor,
  getSlideEditTextParagraphListLevelCommandEffect,
  getSlideEditTextParagraphListLevelJSONPasteValueFromValue,
  getSlideEditTextParagraphListLevelKeyboardIntent,
  getSlideEditTextParagraphListLevelModelValue,
  SLIDE_EDIT_TEXT_PARAGRAPH_LIST_LEVEL_FIELD,
} from './SlideEditTextParagraphListLevel'

describe('SlideEditTextParagraphListLevel', () => {
  it('creates list level descriptors with indent metadata', () => {
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
  })

  it('maps Tab and Shift+Tab to list level keyboard intents', () => {
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'Tab',
    })).toEqual({
      commandId: 'increase-text-paragraph-list-level',
      delta: 1,
      intent: 'slide-edit-text-paragraph-list-level-keyboard-intent',
      kind: 'increase-list-level',
      preventDefault: true,
      shortcut: 'Tab',
    })
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'Tab',
      shiftKey: true,
    })).toMatchObject({
      commandId: 'decrease-text-paragraph-list-level',
      delta: -1,
      kind: 'decrease-list-level',
      shortcut: 'Shift+Tab',
    })
    expect(getSlideEditTextParagraphListLevelKeyboardIntent({
      key: 'Tab',
      mod: true,
    })).toBeNull()
  })

  it('normalizes step and set list level commands', () => {
    expect(getSlideEditTextParagraphListLevelCommandEffect({
      fieldId: 'paragraphListLevel',
      id: 'set-text-paragraph-list-level',
      kind: 'set-list-level',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 12,
    }).payload).toMatchObject({
      id: 'set-text-paragraph-list-level',
      kind: 'set-list-level',
      value: 5,
    })
    expect(getSlideEditTextParagraphListLevelCommandEffect({
      delta: 99 as never,
      fieldId: 'paragraphListLevel',
      id: 'increase-text-paragraph-list-level',
      kind: 'increase-list-level',
      objectId: 'object-a',
      slideId: 'slide-a',
    }).payload).toMatchObject({
      delta: 1,
      id: 'increase-text-paragraph-list-level',
      kind: 'increase-list-level',
    })
  })

  it('parses list level JSON paste values from known keys', () => {
    expect(getSlideEditTextParagraphListLevelJSONPasteValueFromValue(
      { paragraphStyle: { listLevel: '3' } },
      { mode: 'wrapped' },
    )).toBe(3)
    expect(getSlideEditTextParagraphListLevelJSONPasteValueFromValue(
      { indentLevel: 99 },
      { mode: 'direct' },
    )).toBe(5)
    expect(getSlideEditTextParagraphListLevelModelValue(0)).toBeUndefined()
  })
})

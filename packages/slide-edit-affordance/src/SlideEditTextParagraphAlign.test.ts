import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphAlignDescriptor,
  getSlideEditTextParagraphAlignCommandEffect,
  getSlideEditTextParagraphAlignJSONPasteValueFromValue,
  getSlideEditTextParagraphAlignKeyboardIntent,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
  SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS,
} from './SlideEditTextParagraphAlign'

describe('SlideEditTextParagraphAlign', () => {
  it('creates paragraph alignment descriptors', () => {
    expect(createSlideEditTextParagraphAlignDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'center',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_FIELD,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-align',
      value: 'center',
    })
  })

  it('maps Cmd/Ctrl+L, E, and R to paragraph alignment intents', () => {
    expect(SLIDE_EDIT_TEXT_PARAGRAPH_ALIGN_KEYBOARD_KEYS).toBe(
      'Cmd/Ctrl+L Cmd/Ctrl+E Cmd/Ctrl+R',
    )
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: true,
    })).toMatchObject({
      align: 'left',
      kind: 'set-text-paragraph-align',
      shortcut: 'Cmd/Ctrl+L',
    })
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'e',
      mod: true,
    })?.align).toBe('center')
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'r',
      mod: true,
    })?.align).toBe('right')
  })

  it('does not consume alternate paragraph alignment chords', () => {
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      altKey: true,
      key: 'l',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'l',
      mod: true,
      shiftKey: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphAlignKeyboardIntent({
      key: 'j',
      mod: true,
    })).toBeNull()
  })

  it('routes paragraph alignment updates and JSON paste through host commands', () => {
    expect(getSlideEditTextParagraphAlignCommandEffect({
      fieldId: 'paragraphAlign',
      id: 'update-text-paragraph-align',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'right',
    })).toMatchObject({
      payload: {
        value: 'right',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
    })
    expect(getSlideEditTextParagraphAlignJSONPasteValueFromValue(
      { textAlign: 'center' },
      { mode: 'wrapped' },
    )).toBe('center')
  })
})

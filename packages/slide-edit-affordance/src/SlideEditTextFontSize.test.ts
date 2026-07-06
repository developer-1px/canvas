import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextFontSizeDescriptor,
  getSlideEditTextFontSizeCommandEffect,
  getSlideEditTextFontSizeJSONPasteValueFromValue,
  getSlideEditTextFontSizeKeyboardIntent,
  normalizeSlideEditTextFontSize,
  SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
  SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_KEYS,
} from './SlideEditTextFontSize'
import {
  getSlideEditTextFontSizeKeyboardIntent as getSlideEditTextFontSizeKeyboardIntentFromPackage,
} from './index'

describe('SlideEditTextFontSize', () => {
  it('creates font size descriptors with metadata and import keys', () => {
    expect(createSlideEditTextFontSizeDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: '18.256',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_FONT_SIZE_FIELD,
      metadata: {
        attribute: 'data-slide-text-font-size',
        defaultValue: 16,
        value: 18.26,
      },
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-font-size',
      value: 18.26,
    })
    expect(SLIDE_EDIT_TEXT_FONT_SIZE_FIELD).toMatchObject({
      commandId: 'update-text-font-size',
      control: 'font-size-stepper',
      id: 'fontSize',
      jsonKeys: ['textFontSize', 'fontSize', 'size', 'value'],
      jsonMimeType:
        'application/vnd.interactive-os.slide-edit.text-font-size+json',
      step: 0.5,
    })
  })

  it('maps font size increase and decrease keyboard shortcuts', () => {
    expect(SLIDE_EDIT_TEXT_FONT_SIZE_KEYBOARD_KEYS).toBe(
      'Cmd/Ctrl+Shift+> Cmd/Ctrl+Shift+<',
    )
    expect(getSlideEditTextFontSizeKeyboardIntent({
      code: 'Period',
      key: '>',
      mod: true,
      shiftKey: true,
    })).toEqual({
      commandId: 'update-text-font-size',
      delta: 0.5,
      direction: 'increase',
      fieldId: 'fontSize',
      intent: 'slide-edit-text-font-size-keyboard-intent',
      keyboardModel: 'slide-edit-text-font-size-keyboard-shortcuts',
      kind: 'increase-text-font-size',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+Shift+>',
      step: 0.5,
    })
    expect(getSlideEditTextFontSizeKeyboardIntent({
      code: 'Comma',
      key: '<',
      mod: true,
      shiftKey: true,
    })).toMatchObject({
      delta: -0.5,
      direction: 'decrease',
      shortcut: 'Cmd/Ctrl+Shift+<',
    })
  })

  it('ignores non-text font size keyboard chords', () => {
    expect(getSlideEditTextFontSizeKeyboardIntent({
      key: '>',
      mod: true,
      shiftKey: false,
    })).toBeNull()
    expect(getSlideEditTextFontSizeKeyboardIntent({
      altKey: true,
      key: '>',
      mod: true,
      shiftKey: true,
    })).toBeNull()
    expect(getSlideEditTextFontSizeKeyboardIntent({
      key: 'x',
      mod: true,
      shiftKey: true,
    })).toBeNull()
  })

  it('routes font size updates through host command effects and JSON paste', () => {
    expect(getSlideEditTextFontSizeCommandEffect({
      fieldId: 'fontSize',
      id: 'update-text-font-size',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 999,
    }).payload.value).toBe(400)
    expect(getSlideEditTextFontSizeJSONPasteValueFromValue(
      { textFontSize: '24' },
      { mode: 'wrapped' },
    )).toBe(24)
    expect(normalizeSlideEditTextFontSize(Number.NaN)).toBe(16)
    expect(getSlideEditTextFontSizeKeyboardIntentFromPackage({
      code: 'Period',
      key: '>',
      mod: true,
      shiftKey: true,
    })?.kind).toBe('increase-text-font-size')
  })
})

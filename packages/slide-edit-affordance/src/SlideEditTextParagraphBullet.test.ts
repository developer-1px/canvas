import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextParagraphBulletDescriptor,
  getSlideEditTextParagraphBulletCommandEffect,
  getSlideEditTextParagraphBulletJSONPasteValueFromValue,
  getSlideEditTextParagraphBulletKeyboardIntent,
  SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD,
} from './SlideEditTextParagraphBullet'

describe('SlideEditTextParagraphBullet', () => {
  it('creates paragraph bullet descriptors', () => {
    expect(createSlideEditTextParagraphBulletDescriptor({
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'numbered',
    })).toEqual({
      field: SLIDE_EDIT_TEXT_PARAGRAPH_BULLET_FIELD,
      objectId: 'object-a',
      slideId: 'slide-a',
      surface: 'text-paragraph-bullet',
      value: 'numbered',
    })
  })

  it('maps bullet and numbered list keyboard intents', () => {
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      key: 'l',
      mod: true,
      shiftKey: true,
    })).toEqual({
      commandId: 'toggle-text-paragraph-bullet',
      intent: 'slide-edit-text-paragraph-bullet-keyboard-intent',
      kind: 'toggle-bullet',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+Shift+L',
      value: 'bullet',
    })
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      code: 'Digit7',
      key: '&',
      mod: true,
      shiftKey: true,
    })).toEqual({
      commandId: 'toggle-text-paragraph-bullet',
      intent: 'slide-edit-text-paragraph-numbered-keyboard-intent',
      kind: 'toggle-numbered',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+Shift+7',
      value: 'numbered',
    })
  })

  it('ignores non-list keyboard chords', () => {
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      key: 'l',
      mod: true,
    })).toBeNull()
    expect(getSlideEditTextParagraphBulletKeyboardIntent({
      altKey: true,
      key: '7',
      mod: true,
      shiftKey: true,
    })).toBeNull()
  })

  it('routes paragraph bullet updates and JSON paste through host commands', () => {
    expect(getSlideEditTextParagraphBulletCommandEffect({
      fieldId: 'paragraphBullet',
      id: 'update-text-paragraph-bullet',
      objectId: 'object-a',
      slideId: 'slide-a',
      value: 'unknown' as never,
    }).payload.value).toBe('none')
    expect(getSlideEditTextParagraphBulletJSONPasteValueFromValue(
      { list: 'bullet' },
      { mode: 'wrapped' },
    )).toBe('bullet')
  })
})

import { describe, expect, it } from 'vitest'

import {
  getSlideEditTextFormattingKeyboardIntent,
} from './SlideEditTextFormattingKeyboard'
import {
  getSlideEditTextFormattingKeyboardIntent as getSlideEditTextFormattingKeyboardIntentFromPackage,
} from './index'

describe('SlideEditTextFormattingKeyboard', () => {
  it('maps Cmd/Ctrl+B, I, and U to text formatting intents', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'b',
      mod: true,
    })).toEqual({
      commandId: 'toggle-bold',
      kind: 'toggle-bold',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+B',
    })

    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'I',
      mod: true,
    })).toEqual({
      commandId: 'toggle-italic',
      kind: 'toggle-italic',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+I',
    })

    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'u',
      mod: true,
    })).toEqual({
      commandId: 'toggle-underline',
      kind: 'toggle-underline',
      preventDefault: true,
      shortcut: 'Cmd/Ctrl+U',
    })
  })

  it('returns null without the primary modifier', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'b',
      mod: false,
    })).toBeNull()
  })

  it('returns null for alternate modifier chords', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      altKey: true,
      key: 'b',
      mod: true,
    })).toBeNull()

    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'b',
      mod: true,
      shiftKey: true,
    })).toBeNull()
  })

  it('returns null for unsupported keys', () => {
    expect(getSlideEditTextFormattingKeyboardIntent({
      key: 'x',
      mod: true,
    })).toBeNull()
  })

  it('is available from the package index', () => {
    expect(getSlideEditTextFormattingKeyboardIntentFromPackage({
      key: 'b',
      mod: true,
    })).toMatchObject({
      kind: 'toggle-bold',
      shortcut: 'Cmd/Ctrl+B',
    })
  })
})

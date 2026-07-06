import { describe, expect, it } from 'vitest'

import {
  createSlideEditTextRunFormattingDescriptor,
  getSlideEditTextFormattingKeyboardIntent,
  getSlideEditTextRunFormattingCommandEffect,
  getSlideEditTextRunFormattingJSONPasteValueFromValue,
  getSlideEditTextRunHighlightJSONPasteValueFromValue,
  normalizeSlideEditTextRunColorValue,
  normalizeSlideEditTextRunSize,
  SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS,
} from './SlideEditTextFormattingKeyboard'
import {
  getSlideEditTextFormattingKeyboardIntent as getSlideEditTextFormattingKeyboardIntentFromPackage,
  SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS as SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS_FROM_PACKAGE,
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
    expect(SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS_FROM_PACKAGE.map((field) =>
      field.id
    )).toContain('strikethrough')
  })

  it('describes text run formatting fields including strikethrough and highlight', () => {
    expect(createSlideEditTextRunFormattingDescriptor({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
    })).toMatchObject({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
      surface: 'text-run-formatting',
    })
    expect(SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.map((field) => field.id))
      .toEqual([
        'bold',
        'italic',
        'underline',
        'size',
        'color',
        'highlight',
        'strikethrough',
      ])
    expect(SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.find((field) =>
      field.id === 'strikethrough'
    )).toMatchObject({
      control: 'toggle',
      jsonKeys: expect.arrayContaining([
        'textRunStrikethrough',
        'runStrikethrough',
        'strikethrough',
        'strikeThrough',
        'strike',
      ]),
      jsonMimeType:
        'application/vnd.interactive-os.slide-edit.text-run-strikethrough+json',
    })
    expect(SLIDE_EDIT_TEXT_RUN_FORMATTING_FIELDS.find((field) =>
      field.id === 'highlight'
    )).toMatchObject({
      control: 'color-swatch',
      jsonKeys: expect.arrayContaining([
        'textRunHighlight',
        'textRunHighlightColor',
        'runHighlight',
        'runHighlightColor',
        'highlight',
        'highlightColor',
        'backgroundColor',
      ]),
      jsonMimeType:
        'application/vnd.interactive-os.slide-edit.text-run-highlight+json',
    })
  })

  it('normalizes run formatting command effects', () => {
    expect(getSlideEditTextRunFormattingCommandEffect({
      fieldId: 'strikethrough',
      id: 'update-text-run-formatting',
      objectIds: ['object-a'],
      slideId: 'slide-a',
      value: true,
    })).toEqual({
      payload: {
        fieldId: 'strikethrough',
        id: 'update-text-run-formatting',
        objectIds: ['object-a'],
        slideId: 'slide-a',
        value: true,
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
    expect(getSlideEditTextRunFormattingCommandEffect({
      fieldId: 'highlight',
      id: 'update-text-run-formatting',
      objectIds: ['object-a'],
      slideId: 'slide-a',
      value: 'ff0',
    }).payload.value).toBe('#ffff00')
    expect(normalizeSlideEditTextRunSize(999)).toBe(400)
    expect(normalizeSlideEditTextRunColorValue('2563eb')).toBe('#2563eb')
  })

  it('parses run formatting JSON paste values by field', () => {
    expect(getSlideEditTextRunFormattingJSONPasteValueFromValue(
      { strike: true },
      { fieldId: 'strikethrough', mode: 'wrapped' },
    )).toBe(true)
    expect(getSlideEditTextRunHighlightJSONPasteValueFromValue(
      { backgroundColor: 'fef08a' },
      { mode: 'wrapped' },
    )).toBe('#fef08a')
    expect(getSlideEditTextRunFormattingJSONPasteValueFromValue(
      { strike: 'true' },
      { fieldId: 'strikethrough', mode: 'wrapped' },
    )).toBeNull()
  })
})

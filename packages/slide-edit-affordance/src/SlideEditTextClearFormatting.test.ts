import { describe, expect, it, vi } from 'vitest'

import {
  createSlideEditTextClearFormattingDescriptor,
  getSlideEditTextClearFormattingCommandEffect,
  getSlideEditTextClearFormattingJSONPasteValue,
  getSlideEditTextClearFormattingJSONPasteValueFromValue,
} from './SlideEditTextClearFormatting'

describe('SlideEditTextClearFormatting', () => {
  it('creates clear formatting descriptors and command effects', () => {
    expect(createSlideEditTextClearFormattingDescriptor({
      objectIds: ['object-a', 'object-b'],
      slideId: 'slide-a',
    })).toMatchObject({
      commandId: 'clear-text-formatting',
      control: 'button',
      objectIds: ['object-a', 'object-b'],
      requiredAdapterSlot: 'command-effect',
      slideId: 'slide-a',
      surface: 'text-clear-formatting',
    })
    expect(getSlideEditTextClearFormattingCommandEffect({
      objectIds: ['object-a'],
      slideId: 'slide-a',
    })).toEqual({
      payload: {
        id: 'clear-text-formatting',
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      selection: {
        objectIds: ['object-a'],
        slideId: 'slide-a',
      },
      type: 'slide-command-effect',
    })
  })

  it('parses only explicit true JSON clear formatting values', () => {
    expect(getSlideEditTextClearFormattingJSONPasteValueFromValue(
      { clearFormatting: true },
      { mode: 'wrapped' },
    )).toBe(true)
    expect(getSlideEditTextClearFormattingJSONPasteValueFromValue(
      { clearFormatting: false },
      { mode: 'wrapped' },
    )).toBeNull()
    expect(getSlideEditTextClearFormattingJSONPasteValueFromValue(
      true,
      { mode: 'direct' },
    )).toBe(true)
  })

  it('does not treat text/plain true as a direct clear formatting command', () => {
    const dataTransfer = {
      getData: vi.fn((type: string) => type === 'text/plain' ? 'true' : ''),
    } as unknown as DataTransfer

    expect(getSlideEditTextClearFormattingJSONPasteValue({
      dataTransfer,
    })).toBeNull()
  })
})

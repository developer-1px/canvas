import { describe, expect, it } from 'vitest'
import type {
  CanvasAppCustomCommandState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  getCanvasKeyboardCustomCommandShortcutIntent,
} from './CanvasKeyboardExtensionShortcutIntent'

function createCommandState(
  overrides: Partial<CanvasAppCustomCommandState> = {},
): CanvasAppCustomCommandState {
  return {
    ariaLabel: 'Log selection',
    disabled: false,
    id: 'log-selection',
    label: 'Log',
    shortcut: { key: 'j' },
    title: 'Log selection',
    ...overrides,
  }
}

function createKeydown(key: string, shiftKey = false) {
  return { key, shiftKey } as globalThis.KeyboardEvent
}

describe('CanvasKeyboardExtensionShortcutIntent', () => {
  it('matches an enabled custom command shortcut', () => {
    expect(
      getCanvasKeyboardCustomCommandShortcutIntent({
        customCommands: [createCommandState()],
        event: createKeydown('j'),
      }),
    ).toBe('log-selection')
  })

  it('skips disabled commands and unmatched chords', () => {
    expect(
      getCanvasKeyboardCustomCommandShortcutIntent({
        customCommands: [createCommandState({ disabled: true })],
        event: createKeydown('j'),
      }),
    ).toBeNull()
    expect(
      getCanvasKeyboardCustomCommandShortcutIntent({
        customCommands: [createCommandState()],
        event: createKeydown('j', true),
      }),
    ).toBeNull()
    expect(
      getCanvasKeyboardCustomCommandShortcutIntent({
        customCommands: [createCommandState({ shortcut: undefined })],
        event: createKeydown('j'),
      }),
    ).toBeNull()
  })
})

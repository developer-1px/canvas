import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import {
  getCanvasKeyboardBuiltinToolShortcut,
  getCanvasKeyboardReservedToolShortcuts,
} from './CanvasKeyboardToolShortcuts'

describe('CanvasKeyboardToolShortcuts', () => {
  it('resolves built-in tool shortcuts from descriptors', () => {
    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'M' }),
      key: 'm',
    })).toBe('marker')

    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'M', shiftKey: true }),
      key: 'm',
    })).toBe('highlight')
  })

  it('keeps shift-insensitive built-in tool shortcuts explicit', () => {
    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'V', shiftKey: true }),
      key: 'v',
    })).toBe('select')
  })

  it('honors tool shortcut feature toggles', () => {
    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig({
        shortcuts: { rectTool: false },
      }),
      event: createKeyboardEvent({ key: 'R' }),
      key: 'r',
    })).toBeNull()

    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig({
        tools: { rect: false },
      }),
      event: createKeyboardEvent({ key: 'R' }),
      key: 'r',
    })).toBeNull()
  })

  it('exports reserved shortcuts for custom creation tool contracts', () => {
    expect(getCanvasKeyboardReservedToolShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'select tool', shortcut: { key: 'v' } },
        { label: 'select tool', shortcut: { key: 'v', shiftKey: true } },
        { label: 'marker tool', shortcut: { key: 'm' } },
        {
          label: 'highlighter tool',
          shortcut: { key: 'm', shiftKey: true },
        },
      ]),
    )
  })
})

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    key: 'v',
    shiftKey: false,
    ...overrides,
  } as KeyboardEvent
}

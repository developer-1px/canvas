import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../../engine'
import {
  getCanvasKeyboardBuiltinToolShortcut,
  getCanvasKeyboardReservedToolShortcuts,
  getCanvasKeyboardToolAriaKeyshortcuts,
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

    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'O' }),
      key: 'o',
    })).toBe('ellipse')
  })

  it('keeps shifted section distinct from sticky', () => {
    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 's' }),
      key: 's',
    })).toBe('sticky')

    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'S', shiftKey: true }),
      key: 's',
    })).toBe('section')
  })

  it('keeps shift-insensitive built-in tool shortcuts explicit', () => {
    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'V', shiftKey: true }),
      key: 'v',
    })).toBe('select')
  })

  it('does not resolve tool shortcuts with command modifiers', () => {
    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'M', metaKey: true }),
      key: 'm',
    })).toBeNull()

    expect(getCanvasKeyboardBuiltinToolShortcut({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ altKey: true, key: 'H' }),
      key: 'h',
    })).toBeNull()
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

  it('projects enabled built-in tool shortcuts to aria-keyshortcuts tokens', () => {
    expect(getCanvasKeyboardToolAriaKeyshortcuts({
      config: createCanvasAffordanceConfig(),
      tool: 'rect',
    })).toBe('r')

    expect(getCanvasKeyboardToolAriaKeyshortcuts({
      config: createCanvasAffordanceConfig(),
      tool: 'section',
    })).toBe('Shift+S')

    expect(getCanvasKeyboardToolAriaKeyshortcuts({
      config: createCanvasAffordanceConfig({
        shortcuts: { rectTool: false },
      }),
      tool: 'rect',
    })).toBeUndefined()
  })

  it('exports reserved shortcuts for custom creation tool contracts', () => {
    expect(getCanvasKeyboardReservedToolShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'select tool', shortcut: { key: 'v' } },
        { label: 'select tool', shortcut: { key: 'v', shiftKey: true } },
        { label: 'pan tool', shortcut: { key: 'h' } },
        { label: 'pan tool', shortcut: { key: 'h', shiftKey: true } },
        { label: 'sticky note tool', shortcut: { key: 's' } },
        { label: 'section tool', shortcut: { key: 's', shiftKey: true } },
        { label: 'ellipse tool', shortcut: { key: 'o' } },
        { label: 'ellipse tool', shortcut: { key: 'o', shiftKey: true } },
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

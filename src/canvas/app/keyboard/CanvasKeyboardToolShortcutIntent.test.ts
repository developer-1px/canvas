import { describe, expect, it } from 'vitest'
import {
  createCanvasAffordanceConfig,
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
} from '../../engine'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'
import { getCanvasKeyboardToolShortcutIntent } from './CanvasKeyboardToolShortcutIntent'

describe('CanvasKeyboardToolShortcutIntent', () => {
  it('keeps built-in tool shortcuts ahead of custom tools', () => {
    const tool = getCanvasKeyboardToolShortcutIntent(createInput({
      customCreationTools: [
        createCustomTool({ shortcut: { key: 'v', shiftKey: true } }),
      ],
      event: createKeyboardEvent({ key: 'V', shiftKey: true }),
      key: 'v',
    }))

    expect(tool).toBe('select')
  })

  it('resolves custom creation tool shortcuts after built-in tools', () => {
    const tool = getCanvasKeyboardToolShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'E', shiftKey: true }),
      key: 'e',
    }))

    expect(tool).toBe('custom:risk')
  })

  it('honors built-in tool feature toggles', () => {
    const tool = getCanvasKeyboardToolShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        shortcuts: { rectTool: false },
      }),
      event: createKeyboardEvent({ key: 'r' }),
      key: 'r',
    }))

    expect(tool).toBeNull()
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasKeyboardToolShortcutIntent>[0]> = {},
): Parameters<typeof getCanvasKeyboardToolShortcutIntent>[0] {
  return {
    config: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    customCreationTools: [createCustomTool()],
    event: createKeyboardEvent(),
    key: 'e',
    ...overrides,
  }
}

function createCustomTool(
  overrides: Partial<CanvasAppCustomCreationToolState> = {},
): CanvasAppCustomCreationToolState {
  return {
    ariaLabel: 'Risk tool',
    id: 'custom:risk',
    label: '!',
    shortcut: { key: 'e', shiftKey: true },
    statusLabel: 'Risk',
    title: 'Risk',
    ...overrides,
  }
}

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    altKey: false,
    code: 'KeyE',
    ctrlKey: false,
    key: 'e',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

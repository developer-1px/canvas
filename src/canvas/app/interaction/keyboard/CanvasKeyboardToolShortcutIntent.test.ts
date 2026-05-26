import { describe, expect, it } from 'vitest'
import {
  createCanvasAffordanceConfig,
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
} from '../../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../../extensions/CanvasAppExtensionStateContracts'
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
      event: createKeyboardEvent({ key: 'K', shiftKey: true }),
      key: 'k',
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

  it('keeps sticky and section shortcuts distinct', () => {
    expect(getCanvasKeyboardToolShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 's' }),
      key: 's',
    }))).toBe('sticky')
    expect(getCanvasKeyboardToolShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'S', shiftKey: true }),
      key: 's',
    }))).toBe('section')
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasKeyboardToolShortcutIntent>[0]> = {},
): Parameters<typeof getCanvasKeyboardToolShortcutIntent>[0] {
  return {
    config: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    customCreationTools: [createCustomTool()],
    event: createKeyboardEvent(),
    key: 'k',
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
    shortcut: { key: 'k', shiftKey: true },
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
    code: 'KeyK',
    ctrlKey: false,
    key: 'k',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

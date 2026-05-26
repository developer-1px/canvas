import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import {
  getCanvasKeyboardReservedViewportShortcuts,
  getCanvasKeyboardViewportShortcutIntent,
} from './CanvasKeyboardViewportShortcuts'
import type { CanvasKeyboardCommandShortcutIntentInput } from './CanvasKeyboardCommandShortcutIntent'

describe('CanvasKeyboardViewportShortcuts', () => {
  it('maps zoom shortcuts to viewport intents', () => {
    expect(getCanvasKeyboardViewportShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '+', metaKey: true }),
      key: '+',
      mod: true,
    }))).toEqual({
      kind: 'zoom-by',
      multiplier: 1.25,
      preventDefault: true,
    })

    expect(getCanvasKeyboardViewportShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '0', metaKey: true }),
      key: '0',
      mod: true,
    }))).toEqual({
      kind: 'reset-viewport',
      preventDefault: true,
    })
  })

  it('maps fit shortcuts to viewport intents', () => {
    expect(getCanvasKeyboardViewportShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '0' }),
      key: '0',
    }))).toEqual({
      kind: 'fit-all',
      preventDefault: true,
    })

    expect(getCanvasKeyboardViewportShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '1' }),
      key: '1',
    }))).toEqual({
      ids: ['item-1'],
      kind: 'fit-selection',
      preventDefault: true,
    })
  })

  it('exports reserved viewport shortcuts for custom tool contracts', () => {
    expect(getCanvasKeyboardReservedViewportShortcuts()).toEqual([
      { label: 'fit all', shortcut: { key: '0' } },
      { label: 'fit selection', shortcut: { key: '1' } },
    ])
  })

  it('honors viewport shortcut feature toggles', () => {
    expect(getCanvasKeyboardViewportShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        commands: { zoomIn: false },
      }),
      event: createKeyboardEvent({ key: '=', metaKey: true }),
      key: '=',
      mod: true,
    }))).toBeNull()

    expect(getCanvasKeyboardViewportShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        shortcuts: { fitAll: false },
      }),
      event: createKeyboardEvent({ key: '0' }),
      key: '0',
    }))).toBeNull()
  })
})

function createInput(
  overrides: Partial<CanvasKeyboardCommandShortcutIntentInput> = {},
): CanvasKeyboardCommandShortcutIntentInput {
  return {
    config: createCanvasAffordanceConfig(),
    event: createKeyboardEvent(),
    key: '0',
    mod: false,
    selection: ['item-1'],
    ...overrides,
  }
}

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    altKey: false,
    code: 'Digit0',
    ctrlKey: false,
    key: '0',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

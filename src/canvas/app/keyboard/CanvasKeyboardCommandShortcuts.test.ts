import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import {
  getCanvasKeyboardBuiltinCommandShortcutIntent,
  getCanvasKeyboardReservedCommandShortcuts,
} from './CanvasKeyboardCommandShortcuts'
import type { CanvasKeyboardCommandShortcutIntentInput } from './CanvasKeyboardCommandShortcutIntent'

describe('CanvasKeyboardCommandShortcuts', () => {
  it('resolves built-in command shortcuts from descriptors', () => {
    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '=', metaKey: true }),
      key: '=',
      mod: true,
    }))).toEqual({
      kind: 'zoom-by',
      multiplier: 1.25,
      preventDefault: true,
    })

    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      event: createKeyboardEvent({
        code: 'BracketLeft',
        key: '[',
        metaKey: true,
        shiftKey: true,
      }),
      key: '[',
      mod: true,
    }))).toEqual({
      kind: 'reorder-selection',
      mode: 'sendToBack',
      preventDefault: true,
    })
  })

  it('keeps nudge ownership explicit even without selection', () => {
    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'ArrowLeft' }),
      key: 'arrowleft',
      selection: [],
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })

  it('exports reserved command shortcuts for custom creation tool contracts', () => {
    expect(getCanvasKeyboardReservedCommandShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'fit all', shortcut: { key: '0' } },
        { label: 'fit selection', shortcut: { key: '1' } },
        { label: 'delete', shortcut: { key: 'Delete' } },
        { label: 'delete', shortcut: { key: 'Delete', shiftKey: true } },
        {
          label: 'large nudge left',
          shortcut: { key: 'ArrowLeft', shiftKey: true },
        },
      ]),
    )
  })

  it('honors command shortcut feature toggles', () => {
    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        commands: { zoomIn: false },
      }),
      event: createKeyboardEvent({ key: '=', metaKey: true }),
      key: '=',
      mod: true,
    }))).toBeNull()

    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        shortcuts: { nudge: false },
      }),
      event: createKeyboardEvent({ key: 'ArrowLeft' }),
      key: 'arrowleft',
    }))).toBeNull()
  })
})

function createInput(
  overrides: Partial<CanvasKeyboardCommandShortcutIntentInput> = {},
): CanvasKeyboardCommandShortcutIntentInput {
  return {
    config: createCanvasAffordanceConfig(),
    event: createKeyboardEvent(),
    key: 'a',
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
    code: 'KeyA',
    ctrlKey: false,
    key: 'a',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

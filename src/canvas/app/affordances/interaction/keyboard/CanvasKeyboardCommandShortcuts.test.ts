import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../../engine'
import {
  getCanvasKeyboardBuiltinCommandShortcutIntent,
  getCanvasKeyboardReservedCommandShortcuts,
} from './CanvasKeyboardCommandShortcuts'
import type { CanvasKeyboardCommandShortcutIntentInput } from './CanvasKeyboardCommandShortcutIntent'

describe('CanvasKeyboardCommandShortcuts', () => {
  it('resolves built-in command shortcuts from descriptors', () => {
    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'z', metaKey: true }),
      key: 'z',
      mod: true,
    }))).toEqual({
      kind: 'undo-history',
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

  it('exports reserved command shortcuts for custom creation tool contracts', () => {
    expect(getCanvasKeyboardReservedCommandShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'delete', shortcut: { key: 'Delete' } },
        { label: 'delete', shortcut: { key: 'Delete', shiftKey: true } },
      ]),
    )
  })

  it('honors command shortcut feature toggles', () => {
    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        commands: { delete: false },
      }),
      event: createKeyboardEvent({ key: 'Delete' }),
      key: 'delete',
    }))).toBeNull()
  })

  it('keeps quick create sticky on the before-typing shortcut phase', () => {
    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Enter', metaKey: true }),
      key: 'enter',
      mod: true,
      phase: 'before-typing-target',
    }))).toEqual({
      kind: 'quick-create-sticky',
      preventDefault: true,
    })

    expect(getCanvasKeyboardBuiltinCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Enter', metaKey: true }),
      key: 'enter',
      mod: true,
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

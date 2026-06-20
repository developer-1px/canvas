import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../../engine'
import {
  CANVAS_KEYBOARD_NUDGE_INTENT_MODEL,
  CANVAS_KEYBOARD_NUDGE_KEYS,
  CANVAS_KEYBOARD_NUDGE_LARGE_STEP,
  CANVAS_KEYBOARD_NUDGE_MODEL,
  CANVAS_KEYBOARD_NUDGE_STEP,
  getCanvasKeyboardNudgeShortcutIntent,
  getCanvasKeyboardReservedNudgeShortcuts,
} from './CanvasKeyboardNudgeShortcuts'
import type { CanvasKeyboardCommandShortcutIntentInput } from './CanvasKeyboardCommandShortcutIntent'

describe('CanvasKeyboardNudgeShortcuts', () => {
  it('exports nudge shortcut metadata for host DOM contracts', () => {
    expect(CANVAS_KEYBOARD_NUDGE_MODEL).toBe(
      'canvas-keyboard-nudge-shortcuts',
    )
    expect(CANVAS_KEYBOARD_NUDGE_INTENT_MODEL).toBe(
      'canvas-keyboard-nudge-shortcut-intent',
    )
    expect(CANVAS_KEYBOARD_NUDGE_KEYS).toBe(
      'ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown',
    )
    expect(CANVAS_KEYBOARD_NUDGE_STEP).toBe(1)
    expect(CANVAS_KEYBOARD_NUDGE_LARGE_STEP).toBe(10)
  })

  it('maps arrow keys to nudge intents', () => {
    expect(getCanvasKeyboardNudgeShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'ArrowRight' }),
      key: 'arrowright',
    }))).toEqual({
      dx: 1,
      dy: 0,
      kind: 'nudge-selection',
      preventDefault: true,
    })
  })

  it('maps shifted arrow keys to large nudges', () => {
    expect(getCanvasKeyboardNudgeShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'ArrowUp', shiftKey: true }),
      key: 'arrowup',
    }))).toEqual({
      dx: 0,
      dy: -10,
      kind: 'nudge-selection',
      preventDefault: true,
    })
  })

  it('keeps arrow ownership explicit without a selection', () => {
    expect(getCanvasKeyboardNudgeShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'ArrowLeft' }),
      key: 'arrowleft',
      selection: [],
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })

  it('does not resolve nudge shortcuts with command modifiers', () => {
    expect(getCanvasKeyboardNudgeShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'ArrowLeft', metaKey: true }),
      key: 'arrowleft',
      mod: true,
    }))).toBeNull()

    expect(getCanvasKeyboardNudgeShortcutIntent(createInput({
      event: createKeyboardEvent({ altKey: true, key: 'ArrowLeft' }),
      key: 'arrowleft',
    }))).toBeNull()
  })

  it('exports reserved nudge shortcuts for custom tool contracts', () => {
    expect(getCanvasKeyboardReservedNudgeShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'nudge left', shortcut: { key: 'ArrowLeft' } },
        {
          label: 'large nudge left',
          shortcut: { key: 'ArrowLeft', shiftKey: true },
        },
      ]),
    )
  })
})

function createInput(
  overrides: Partial<CanvasKeyboardCommandShortcutIntentInput> = {},
): CanvasKeyboardCommandShortcutIntentInput {
  return {
    config: createCanvasAffordanceConfig(),
    event: createKeyboardEvent(),
    key: 'arrowleft',
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
    code: 'ArrowLeft',
    ctrlKey: false,
    key: 'ArrowLeft',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

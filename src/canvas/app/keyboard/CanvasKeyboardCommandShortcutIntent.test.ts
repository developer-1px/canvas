import { describe, expect, it } from 'vitest'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine'
import {
  getCanvasKeyboardCommandShortcutIntent,
  type CanvasKeyboardCommandShortcutIntentInput,
} from './CanvasKeyboardCommandShortcutIntent'

describe('CanvasKeyboardCommandShortcutIntent', () => {
  it('maps undo and redo shortcuts to history intents', () => {
    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'z', metaKey: true }),
      key: 'z',
      mod: true,
    }))).toEqual({
      kind: 'undo-history',
      preventDefault: true,
    })

    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'z', metaKey: true, shiftKey: true }),
      key: 'z',
      mod: true,
    }))).toEqual({
      kind: 'redo-history',
      preventDefault: true,
    })
  })

  it('maps shifted bracket shortcuts to reorder modes', () => {
    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({
        code: 'BracketRight',
        key: ']',
        metaKey: true,
        shiftKey: true,
      }),
      key: ']',
      mod: true,
    }))).toEqual({
      kind: 'reorder-selection',
      mode: 'bringToFront',
      preventDefault: true,
    })
  })

  it('maps viewport shortcuts through the command shortcut intent seam', () => {
    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '1' }),
      key: '1',
    }))).toEqual({
      ids: ['item-1'],
      kind: 'fit-selection',
      preventDefault: true,
    })
  })

  it('maps sticky quick create before typing-target suppression', () => {
    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Enter', metaKey: true }),
      key: 'enter',
      mod: true,
      phase: 'before-typing-target',
    }))).toEqual({
      kind: 'quick-create-sticky',
      preventDefault: true,
    })

    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Enter', metaKey: true }),
      key: 'enter',
      mod: true,
      phase: 'before-typing-target',
      selection: ['component-sticky', 'component-card'],
    }))).toEqual({
      kind: 'quick-create-sticky',
      preventDefault: true,
    })

    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Enter', metaKey: true }),
      key: 'enter',
      mod: true,
      phase: 'before-typing-target',
      selection: [],
    }))).toEqual({ kind: 'none', preventDefault: false })
  })

  it('keeps arrow keys owned by nudge even without selection', () => {
    expect(getCanvasKeyboardCommandShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'ArrowLeft' }),
      key: 'arrowleft',
      selection: [],
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })
})

function createInput(
  overrides: Partial<CanvasKeyboardCommandShortcutIntentInput> = {},
): CanvasKeyboardCommandShortcutIntentInput {
  return {
    config: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
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

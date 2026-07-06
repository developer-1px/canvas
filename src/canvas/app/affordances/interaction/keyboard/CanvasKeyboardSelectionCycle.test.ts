import { describe, expect, it } from 'vitest'

import {
  getCanvasKeyboardSelectionCycleIntent,
  getCanvasSelectionCycleResult,
} from './CanvasKeyboardSelectionCycle'

describe('CanvasKeyboardSelectionCycle', () => {
  it('maps Tab and Shift+Tab to next and previous selection cycle intents', () => {
    expect(getCanvasKeyboardSelectionCycleIntent({
      event: createKeyboardEvent({ key: 'Tab' }),
      selectableIds: ['a', 'b', 'c'],
      selection: ['a'],
    })).toEqual({
      direction: 'next',
      kind: 'cycle-selection',
      preventDefault: true,
      selection: ['b'],
    })

    expect(getCanvasKeyboardSelectionCycleIntent({
      event: createKeyboardEvent({ key: 'Tab', shiftKey: true }),
      selectableIds: ['a', 'b', 'c'],
      selection: ['a'],
    })).toEqual({
      direction: 'previous',
      kind: 'cycle-selection',
      preventDefault: true,
      selection: ['c'],
    })
  })

  it('starts at the first or final selectable id when selection has no anchor', () => {
    expect(getCanvasSelectionCycleResult({
      direction: 'next',
      selectableIds: ['a', 'b', 'c'],
      selection: [],
    })).toEqual(['a'])
    expect(getCanvasSelectionCycleResult({
      direction: 'previous',
      selectableIds: ['a', 'b', 'c'],
      selection: ['outside'],
    })).toEqual(['c'])
  })

  it('does not prevent default when no selectable ids exist', () => {
    expect(getCanvasKeyboardSelectionCycleIntent({
      event: createKeyboardEvent({ key: 'Tab' }),
      selectableIds: [],
      selection: ['a'],
    })).toEqual({ kind: 'none', preventDefault: false })
  })

  it('does not cycle from typing targets, modal traps, or modified keys', () => {
    withTypingTargetConstructor('HTMLInputElement', (target) => {
      expect(getCanvasKeyboardSelectionCycleIntent({
        event: createKeyboardEvent({ key: 'Tab', target }),
        selectableIds: ['a'],
        selection: [],
      })).toEqual({ kind: 'none', preventDefault: false })
    })

    const modalTarget = new EventTarget()

    expect(getCanvasKeyboardSelectionCycleIntent({
      event: createKeyboardEvent({ key: 'Tab', target: modalTarget }),
      isSuppressedTarget: (target) => target === modalTarget,
      selectableIds: ['a'],
      selection: [],
    })).toEqual({ kind: 'none', preventDefault: false })
    expect(getCanvasKeyboardSelectionCycleIntent({
      event: createKeyboardEvent({ ctrlKey: true, key: 'Tab' }),
      selectableIds: ['a'],
      selection: [],
    })).toEqual({ kind: 'none', preventDefault: false })
  })
})

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    altKey: false,
    ctrlKey: false,
    key: 'Tab',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

function withTypingTargetConstructor<
  TKey extends
    | 'HTMLElement'
    | 'HTMLInputElement'
    | 'HTMLSelectElement'
    | 'HTMLTextAreaElement',
>(
  key: TKey,
  run: (target: EventTarget & { isContentEditable?: boolean }) => void,
) {
  const previous = globalThis[key]

  class TestTarget extends EventTarget {
    isContentEditable = false
  }

  globalThis[key] = TestTarget as never

  try {
    run(new TestTarget())
  } finally {
    globalThis[key] = previous as never
  }
}

import { describe, expect, it } from 'vitest'
import {
  getCanvasKeyboardSelectionCycleIntent,
  isCanvasKeyboardSelectionCycleTarget,
} from './CanvasKeyboardSelectionCycle'

const selectableIds = ['title', 'body', 'image'] as const

describe('CanvasKeyboardSelectionCycle', () => {
  it('maps Tab and Shift Tab to wrapped selection cycle intents', () => {
    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      selection: ['title'],
    }))).toEqual({
      direction: 'next',
      fromId: 'title',
      index: 1,
      kind: 'cycle-selection',
      preventDefault: true,
      selectableIds,
      stopPropagation: false,
      targetId: 'body',
    })

    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      event: createKeyboardEvent({ shiftKey: true }),
      selection: ['title'],
    }))).toEqual({
      direction: 'previous',
      fromId: 'title',
      index: 2,
      kind: 'cycle-selection',
      preventDefault: true,
      selectableIds,
      stopPropagation: false,
      targetId: 'image',
    })

    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      selection: ['image'],
    }))).toMatchObject({
      direction: 'next',
      fromId: 'image',
      index: 0,
      targetId: 'title',
    })
  })

  it('starts from the first or last selectable id when selection has no anchor', () => {
    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      selection: [],
    }))).toMatchObject({
      direction: 'next',
      fromId: null,
      index: 0,
      targetId: 'title',
    })

    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      event: createKeyboardEvent({ shiftKey: true }),
      selection: ['missing'],
    }))).toMatchObject({
      direction: 'previous',
      fromId: null,
      index: 2,
      targetId: 'image',
    })
  })

  it('uses the last selected selectable id as the cycle anchor', () => {
    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      selection: ['title', 'image', 'missing'],
    }))).toMatchObject({
      direction: 'next',
      fromId: 'image',
      index: 0,
      targetId: 'title',
    })
  })

  it('does not prevent default when the key or state should not cycle', () => {
    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      event: createKeyboardEvent({ key: 'Enter' }),
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })

    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      event: createKeyboardEvent({ metaKey: true }),
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })

    expect(getCanvasKeyboardSelectionCycleIntent(createInput({
      selectableIds: [],
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('requires an allowed target and blocks control or modal targets', () => {
    withKeyboardTarget(['.canvas-stage'], (target) => {
      expect(getCanvasKeyboardSelectionCycleIntent(createInput({
        event: createKeyboardEvent({ target }),
        targetSelectors: '.canvas-stage, [data-canvas-item]',
      }))).toMatchObject({
        kind: 'cycle-selection',
        targetId: 'body',
      })
    })

    withKeyboardTarget(['.outside-panel'], (target) => {
      expect(getCanvasKeyboardSelectionCycleIntent(createInput({
        event: createKeyboardEvent({ target }),
        targetSelectors: '.canvas-stage, [data-canvas-item]',
      }))).toEqual({
        kind: 'none',
        preventDefault: false,
        stopPropagation: false,
      })
    })

    withTypingTargetConstructor('HTMLInputElement', (target) => {
      expect(isCanvasKeyboardSelectionCycleTarget({ target })).toBe(false)
    })

    withKeyboardTarget(['[data-canvas-modal-focus-trap]'], (target) => {
      expect(isCanvasKeyboardSelectionCycleTarget({
        blockedTargetSelectors: '[data-canvas-modal-focus-trap]',
        target,
        targetSelectors: '.canvas-stage, [data-canvas-item]',
      })).toBe(false)
    })
  })
})

function createInput(
  overrides:
    Partial<Parameters<typeof getCanvasKeyboardSelectionCycleIntent>[0]> = {},
): Parameters<typeof getCanvasKeyboardSelectionCycleIntent>[0] {
  return {
    event: createKeyboardEvent(),
    selectableIds,
    selection: ['title'],
    ...overrides,
  }
}

function createKeyboardEvent(
  overrides:
    Partial<Parameters<typeof getCanvasKeyboardSelectionCycleIntent>[0]['event']> =
      {},
): Parameters<typeof getCanvasKeyboardSelectionCycleIntent>[0]['event'] {
  return {
    altKey: false,
    ctrlKey: false,
    key: 'Tab',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  }
}

function withKeyboardTarget(
  matchedSelectors: readonly string[],
  run: (target: EventTarget) => void,
) {
  const previous = globalThis.Element

  class TestElement extends EventTarget {
    closest(selector: string) {
      return matchedSelectors.some((matchedSelector) =>
          selector.includes(matchedSelector)
        )
        ? this
        : null
    }
  }

  globalThis.Element = TestElement as never

  try {
    run(new TestElement())
  } finally {
    globalThis.Element = previous as never
  }
}

function withTypingTargetConstructor<
  TKey extends
    | 'HTMLInputElement'
    | 'HTMLSelectElement'
    | 'HTMLTextAreaElement',
>(
  key: TKey,
  run: (target: EventTarget) => void,
) {
  const previous = globalThis[key]

  class TestTarget extends EventTarget {}

  globalThis[key] = TestTarget as never

  try {
    run(new TestTarget())
  } finally {
    globalThis[key] = previous as never
  }
}

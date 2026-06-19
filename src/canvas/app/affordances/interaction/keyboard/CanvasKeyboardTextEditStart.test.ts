import { describe, expect, it } from 'vitest'
import {
  getCanvasKeyboardTextEditStartIntent,
  isCanvasKeyboardTextEditStartKey,
} from './CanvasKeyboardTextEditStart'

describe('CanvasKeyboardTextEditStart', () => {
  it('maps modifier-free printable keys to text edit start intents', () => {
    expect(getCanvasKeyboardTextEditStartIntent(createInput({
      event: createKeyboardEvent({ key: 'x' }),
    }))).toEqual({
      initialText: 'x',
      kind: 'start-text-edit',
      preventDefault: true,
      targetId: 'title',
    })

    expect(getCanvasKeyboardTextEditStartIntent(createInput({
      event: createKeyboardEvent({ key: 'A' }),
    }))).toEqual({
      initialText: 'A',
      kind: 'start-text-edit',
      preventDefault: true,
      targetId: 'title',
    })
  })

  it('does not start editing for non-printable, composing, or modified keys', () => {
    expect(isCanvasKeyboardTextEditStartKey(
      createKeyboardEvent({ key: 'Enter' }),
    )).toBe(false)
    expect(isCanvasKeyboardTextEditStartKey(
      createKeyboardEvent({ isComposing: true, key: 'ㄱ' }),
    )).toBe(false)

    for (const event of [
      createKeyboardEvent({ altKey: true, key: 'x' }),
      createKeyboardEvent({ ctrlKey: true, key: 'x' }),
      createKeyboardEvent({ key: 'x', metaKey: true }),
    ]) {
      expect(getCanvasKeyboardTextEditStartIntent(createInput({ event })))
        .toEqual({
          kind: 'none',
          preventDefault: false,
        })
    }
  })

  it('requires a single editable text selection', () => {
    expect(getCanvasKeyboardTextEditStartIntent(createInput({
      selection: [],
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })

    expect(getCanvasKeyboardTextEditStartIntent(createInput({
      selection: ['title', 'body'],
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })

    expect(getCanvasKeyboardTextEditStartIntent(createInput({
      isEditableTextSelection: false,
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })

  it('lets hosts reserve conflicting single-key tool shortcuts', () => {
    expect(getCanvasKeyboardTextEditStartIntent(createInput({
      event: createKeyboardEvent({ key: 'r' }),
      isReservedShortcut: ({ key }) => key === 'r',
    }))).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })

  it('suppresses native typing targets and host blocked targets', () => {
    withTypingTargetConstructor('HTMLInputElement', (target) => {
      expect(getCanvasKeyboardTextEditStartIntent(createInput({
        event: createKeyboardEvent({ target }),
      }))).toEqual({
        kind: 'none',
        preventDefault: false,
      })
    })

    withKeyboardTarget('[data-canvas-layer-pane]', (target) => {
      expect(getCanvasKeyboardTextEditStartIntent(createInput({
        blockedTargetSelectors: '[data-canvas-layer-pane]',
        event: createKeyboardEvent({ target }),
      }))).toEqual({
        kind: 'none',
        preventDefault: false,
      })
    })
  })
})

function createInput(
  overrides:
    Partial<Parameters<typeof getCanvasKeyboardTextEditStartIntent>[0]> = {},
): Parameters<typeof getCanvasKeyboardTextEditStartIntent>[0] {
  return {
    event: createKeyboardEvent(),
    isEditableTextSelection: true,
    selection: ['title'],
    ...overrides,
  }
}

function createKeyboardEvent(
  overrides:
    Partial<Parameters<typeof getCanvasKeyboardTextEditStartIntent>[0]['event']> =
      {},
): Parameters<typeof getCanvasKeyboardTextEditStartIntent>[0]['event'] {
  return {
    altKey: false,
    ctrlKey: false,
    isComposing: false,
    key: 'x',
    metaKey: false,
    target: null,
    ...overrides,
  }
}

function withKeyboardTarget(
  matchedSelector: string,
  run: (target: EventTarget) => void,
) {
  const previous = globalThis.Element

  class TestElement extends EventTarget {
    closest(selector: string) {
      return selector.includes(matchedSelector) ? this : null
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

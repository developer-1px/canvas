import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  createCanvasAffordanceConfig,
} from '../../../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  getCanvasKeyboardShortcutIntent,
  isCanvasKeyboardControlTarget,
  isCanvasKeyboardTypingTarget,
} from './CanvasKeyboardShortcutIntent'

describe('CanvasKeyboardShortcutIntent', () => {
  it('routes core editing and creation shortcuts from the canvas surface', () => {
    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Delete' }),
    }))).toEqual({
      kind: 'delete-selection',
      preventDefault: true,
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Backspace' }),
    }))).toEqual({
      kind: 'delete-selection',
      preventDefault: true,
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'z', metaKey: true }),
    }))).toEqual({
      kind: 'undo-history',
      preventDefault: true,
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({
        key: 'z',
        metaKey: true,
        shiftKey: true,
      }),
    }))).toEqual({
      kind: 'redo-history',
      preventDefault: true,
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'y', metaKey: true }),
    }))).toEqual({
      kind: 'redo-history',
      preventDefault: true,
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ code: 'Space', key: ' ' }),
    }))).toEqual({
      kind: 'temporary-pan',
      preventDefault: true,
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'h' }),
    }))).toEqual({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'pan',
    })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'm' }),
    }))).toEqual({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'marker',
    })
  })

  it('does not route canvas shortcuts when extra command modifiers are present', () => {
    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'Delete', metaKey: true }),
    }))).toEqual({ kind: 'none', preventDefault: false })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({
        altKey: true,
        key: 'z',
        metaKey: true,
      }),
    }))).toEqual({ kind: 'none', preventDefault: false })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({
        code: 'Space',
        key: ' ',
        metaKey: true,
      }),
    }))).toEqual({ kind: 'none', preventDefault: false })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ altKey: true, key: 'm' }),
    }))).toEqual({ kind: 'none', preventDefault: false })
  })

  it('resolves custom creation tool shortcuts through the external tool seam', () => {
    const intent = getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: 'K', shiftKey: true }),
    }))

    expect(intent).toEqual({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'custom:risk',
    })
  })

  it('keeps shift-insensitive built-in tool shortcuts ahead of custom tools', () => {
    const intent = getCanvasKeyboardShortcutIntent(createInput({
      customCreationTools: [
        createCustomTool({ shortcut: { key: 'v', shiftKey: true } }),
      ],
      event: createKeyboardEvent({ key: 'V', shiftKey: true }),
    }))

    expect(intent).toEqual({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'select',
    })
  })

  it('keeps temporary pan ahead of custom space shortcuts', () => {
    const intent = getCanvasKeyboardShortcutIntent(createInput({
      customCreationTools: [createCustomTool({ shortcut: { key: 'Space' } })],
      event: createKeyboardEvent({ code: 'Space', key: ' ' }),
    }))

    expect(intent).toEqual({
      kind: 'temporary-pan',
      preventDefault: true,
    })
  })

  it('keeps shifted nudge ahead of custom arrow shortcuts', () => {
    const intent = getCanvasKeyboardShortcutIntent(createInput({
      customCreationTools: [
        createCustomTool({
          shortcut: { key: 'ArrowLeft', shiftKey: true },
        }),
      ],
      event: createKeyboardEvent({ key: 'ArrowLeft', shiftKey: true }),
    }))

    expect(intent).toEqual({
      dx: -10,
      dy: 0,
      kind: 'nudge-selection',
      preventDefault: true,
    })
  })

  it('does not route arrow custom tools when nudge owns arrow keys without selection', () => {
    const intent = getCanvasKeyboardShortcutIntent(createInput({
      customCreationTools: [
        createCustomTool({
          shortcut: { key: 'ArrowLeft', shiftKey: true },
        }),
      ],
      event: createKeyboardEvent({ key: 'ArrowLeft', shiftKey: true }),
      selection: [],
    }))

    expect(intent).toEqual({ kind: 'none', preventDefault: false })
  })

  it('keeps find/replace available before typing-target suppression', () => {
    const intent = getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ ctrlKey: true, key: 'f' }),
    }))

    expect(intent).toEqual({
      kind: 'open-find-replace',
      preventDefault: true,
    })
  })

  it('keeps sticky quick create available from text editing targets', () => {
    withTextAreaTarget((target) => {
      const intent = getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          key: 'Enter',
          metaKey: true,
          target,
        }),
      }))

      expect(intent).toEqual({
        kind: 'quick-create-sticky',
        preventDefault: true,
      })
    })
  })

  it('keeps global overlay shortcuts available from focused controls', () => {
    withKeyboardControlTarget('button', (target) => {
      const intent = getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          key: 'k',
          metaKey: true,
          target,
        }),
      }))

      expect(intent).toEqual({
        kind: 'open-command-palette',
        preventDefault: true,
      })
    })
  })

  it('suppresses canvas editing shortcuts from focused controls', () => {
    withKeyboardControlTarget('button', (target) => {
      expect(getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          code: 'Space',
          key: ' ',
          target,
        }),
      }))).toEqual({ kind: 'none', preventDefault: false })

      expect(getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          key: 'Enter',
          target,
        }),
      }))).toEqual({ kind: 'none', preventDefault: false })

      expect(getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          key: 'ArrowRight',
          target,
        }),
      }))).toEqual({ kind: 'none', preventDefault: false })

      expect(getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          key: 'v',
          target,
        }),
      }))).toEqual({ kind: 'none', preventDefault: false })
    })
  })

  it('honors find/replace shortcut and overlay toggles', () => {
    expect(getCanvasKeyboardShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        shortcuts: { findReplace: false },
      }),
      event: createKeyboardEvent({ ctrlKey: true, key: 'f' }),
    }))).toEqual({ kind: 'none', preventDefault: false })

    expect(getCanvasKeyboardShortcutIntent(createInput({
      config: createCanvasAffordanceConfig({
        overlays: { findReplace: false },
      }),
      event: createKeyboardEvent({ ctrlKey: true, key: 'f' }),
    }))).toEqual({ kind: 'none', preventDefault: false })
  })

  it('opens cursor chat only outside typing targets', () => {
    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({ key: '/' }),
    }))).toEqual({
      kind: 'open-cursor-chat',
      preventDefault: true,
    })

    withTextAreaTarget((target) => {
      expect(getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({ key: '/', target }),
      }))).toEqual({ kind: 'none', preventDefault: false })
    })
  })

  it('opens shortcut help only outside typing targets', () => {
    expect(getCanvasKeyboardShortcutIntent(createInput({
      event: createKeyboardEvent({
        code: 'Slash',
        key: '?',
        shiftKey: true,
      }),
    }))).toEqual({
      kind: 'open-shortcut-help',
      preventDefault: true,
    })

    withTextAreaTarget((target) => {
      expect(getCanvasKeyboardShortcutIntent(createInput({
        event: createKeyboardEvent({
          code: 'Slash',
          key: '?',
          shiftKey: true,
          target,
        }),
      }))).toEqual({ kind: 'none', preventDefault: false })
    })
  })

  it('detects native editing controls and contenteditable targets', () => {
    withTypingTargetConstructor('HTMLInputElement', (target) => {
      expect(isCanvasKeyboardTypingTarget(target)).toBe(true)
    })
    withTypingTargetConstructor('HTMLTextAreaElement', (target) => {
      expect(isCanvasKeyboardTypingTarget(target)).toBe(true)
    })
    withTypingTargetConstructor('HTMLSelectElement', (target) => {
      expect(isCanvasKeyboardTypingTarget(target)).toBe(true)
    })
    withTypingTargetConstructor('HTMLElement', (target) => {
      target.isContentEditable = true

      expect(isCanvasKeyboardTypingTarget(target)).toBe(true)
    })
    withTypingTargetConstructor('HTMLElement', (target) => {
      target.isContentEditable = false

      expect(isCanvasKeyboardTypingTarget(target)).toBe(false)
    })
    expect(isCanvasKeyboardTypingTarget(null)).toBe(false)
  })

  it('detects control targets and descendants', () => {
    withKeyboardControlTarget('button', (target) => {
      expect(isCanvasKeyboardControlTarget(target)).toBe(true)
    })
    withKeyboardControlTarget('[role="tab"]', (target) => {
      expect(isCanvasKeyboardControlTarget(target)).toBe(true)
    })
    withKeyboardControlTarget(null, (target) => {
      expect(isCanvasKeyboardControlTarget(target)).toBe(false)
    })
    expect(isCanvasKeyboardControlTarget(null)).toBe(false)
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasKeyboardShortcutIntent>[0]> = {},
): Parameters<typeof getCanvasKeyboardShortcutIntent>[0] {
  return {
    config: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    customCreationTools: [createCustomTool()],
    event: createKeyboardEvent(),
    selection: ['item-1'],
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

function withTextAreaTarget(run: (target: EventTarget) => void) {
  withTypingTargetConstructor('HTMLTextAreaElement', run)
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

function withKeyboardControlTarget(
  matchedSelector: string | null,
  run: (target: EventTarget) => void,
) {
  const previous = globalThis.Element

  class TestElement extends EventTarget {
    closest(selector: string) {
      return matchedSelector && selector.includes(matchedSelector)
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

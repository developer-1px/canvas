import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  createCanvasAffordanceConfig,
} from '../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import { getCanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'

describe('CanvasKeyboardShortcutIntent', () => {
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
  const previous = globalThis.HTMLTextAreaElement

  class TestTextArea extends EventTarget {}

  globalThis.HTMLTextAreaElement =
    TestTextArea as unknown as typeof HTMLTextAreaElement

  try {
    run(new TestTextArea())
  } finally {
    globalThis.HTMLTextAreaElement = previous
  }
}

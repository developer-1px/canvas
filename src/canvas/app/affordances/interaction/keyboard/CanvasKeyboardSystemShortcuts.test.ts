import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../../engine'
import {
  getCanvasKeyboardReservedSystemShortcuts,
  getCanvasKeyboardSystemShortcutIntent,
  shouldReleaseCanvasKeyboardTemporaryPan,
} from './CanvasKeyboardSystemShortcuts'

describe('CanvasKeyboardSystemShortcuts', () => {
  it('resolves find replace before typing-target suppression', () => {
    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'k', metaKey: true }),
      key: 'k',
      mod: true,
      phase: 'before-typing-target',
    })).toEqual({
      kind: 'open-command-palette',
      preventDefault: true,
    })

    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: 'f', metaKey: true }),
      key: 'f',
      mod: true,
      phase: 'before-typing-target',
    })).toEqual({
      kind: 'open-find-replace',
      preventDefault: true,
    })
  })

  it('resolves keyboard shortcut help after typing-target suppression', () => {
    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({
        code: 'Slash',
        key: '?',
        shiftKey: true,
      }),
      key: '?',
      mod: false,
      phase: 'after-typing-target',
    })).toEqual({
      kind: 'open-shortcut-help',
      preventDefault: true,
    })
  })

  it('honors system shortcut feature toggles', () => {
    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig({
        overlays: { commandPalette: false },
      }),
      event: createKeyboardEvent({ key: 'k', metaKey: true }),
      key: 'k',
      mod: true,
      phase: 'before-typing-target',
    })).toBeNull()

    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig({
        shortcuts: { findReplace: false },
      }),
      event: createKeyboardEvent({ key: 'f', metaKey: true }),
      key: 'f',
      mod: true,
      phase: 'before-typing-target',
    })).toBeNull()

    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig({
        gestures: { temporaryPan: false },
      }),
      event: createKeyboardEvent({ code: 'Space', key: ' ' }),
      key: ' ',
      mod: false,
      phase: 'after-typing-target',
    })).toBeNull()

    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig({
        overlays: { shortcutHelp: false },
      }),
      event: createKeyboardEvent({
        code: 'Slash',
        key: '?',
        shiftKey: true,
      }),
      key: '?',
      mod: false,
      phase: 'after-typing-target',
    })).toBeNull()
  })

  it('resolves cursor chat after typing-target suppression', () => {
    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ key: '/' }),
      key: '/',
      mod: false,
      phase: 'after-typing-target',
    })).toEqual({
      kind: 'open-cursor-chat',
      preventDefault: true,
    })

    expect(getCanvasKeyboardSystemShortcutIntent({
      config: createCanvasAffordanceConfig({
        overlays: { cursorChat: false },
      }),
      event: createKeyboardEvent({ key: '/' }),
      key: '/',
      mod: false,
      phase: 'after-typing-target',
    })).toBeNull()
  })

  it('exports reserved system shortcuts for custom creation tool contracts', () => {
    expect(getCanvasKeyboardReservedSystemShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'temporary pan', shortcut: { key: 'Space' } },
        {
          label: 'temporary pan',
          shortcut: { key: 'Space', shiftKey: true },
        },
        { label: 'escape', shortcut: { key: 'Escape' } },
        { label: 'escape', shortcut: { key: 'Escape', shiftKey: true } },
        { label: 'cursor chat', shortcut: { key: '/' } },
        { label: 'keyboard shortcuts', shortcut: { key: '/', shiftKey: true } },
      ]),
    )
  })

  it('checks temporary pan release through the same config contract', () => {
    expect(shouldReleaseCanvasKeyboardTemporaryPan({
      config: createCanvasAffordanceConfig(),
      event: createKeyboardEvent({ code: 'Space', key: ' ' }),
    })).toBe(true)

    expect(shouldReleaseCanvasKeyboardTemporaryPan({
      config: createCanvasAffordanceConfig({
        shortcuts: { temporaryPan: false },
      }),
      event: createKeyboardEvent({ code: 'Space', key: ' ' }),
    })).toBe(false)
  })
})

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    altKey: false,
    code: 'KeyF',
    ctrlKey: false,
    key: 'f',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

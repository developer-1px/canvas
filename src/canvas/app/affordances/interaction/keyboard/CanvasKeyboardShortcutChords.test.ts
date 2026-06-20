import { describe, expect, it } from 'vitest'
import {
  formatCanvasKeyboardShortcutAriaKey,
  formatCanvasKeyboardShortcutChord,
  getCanvasKeyboardShortcutChordKey,
  matchesCanvasKeyboardShortcutBinding,
  matchesCanvasKeyboardShortcutChord,
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
} from './CanvasKeyboardShortcutChords'

describe('CanvasKeyboardShortcutChords', () => {
  it('matches bare shortcut chords exactly', () => {
    expect(matchesCanvasKeyboardShortcutChord({
      event: createKeyboardEvent({ key: 'M' }),
      shortcut: { key: 'm' },
    })).toBe(true)

    expect(matchesCanvasKeyboardShortcutChord({
      event: createKeyboardEvent({ key: 'M', shiftKey: true }),
      shortcut: { key: 'm' },
    })).toBe(false)

    expect(matchesCanvasKeyboardShortcutChord({
      event: createKeyboardEvent({ altKey: true, key: 'm' }),
      shortcut: { key: 'm' },
    })).toBe(false)

    expect(matchesCanvasKeyboardShortcutChord({
      event: createKeyboardEvent({ key: 'm', metaKey: true }),
      shortcut: { key: 'm' },
    })).toBe(false)
  })

  it('matches primary-modifier bindings without accepting extra modifiers', () => {
    expect(matchesCanvasKeyboardShortcutBinding({
      event: createKeyboardEvent({ key: 'z', metaKey: true }),
      options: { modifier: 'mod' },
      shortcut: { key: 'z' },
    })).toBe(true)

    expect(matchesCanvasKeyboardShortcutBinding({
      event: createKeyboardEvent({ key: 'z' }),
      options: { modifier: 'mod' },
      shortcut: { key: 'z' },
    })).toBe(false)

    expect(matchesCanvasKeyboardShortcutBinding({
      event: createKeyboardEvent({ altKey: true, key: 'z', metaKey: true }),
      options: { modifier: 'mod' },
      shortcut: { key: 'z' },
    })).toBe(false)
  })

  it('supports explicit alternate keys, physical codes, and shift-insensitive chords', () => {
    expect(matchesCanvasKeyboardShortcutBinding({
      event: createKeyboardEvent({ key: '+', metaKey: true, shiftKey: true }),
      options: {
        keys: ['=', '+'],
        modifier: 'mod',
        shiftInsensitive: true,
      },
      shortcut: { key: '=' },
    })).toBe(true)

    expect(matchesCanvasKeyboardShortcutBinding({
      event: createKeyboardEvent({
        code: 'Slash',
        key: '?',
        shiftKey: true,
      }),
      options: { code: 'Slash', ignoreKey: true },
      shortcut: { key: '/', shiftKey: true },
    })).toBe(true)
  })

  it('formats, normalizes, and reserves display chords', () => {
    expect(normalizeCanvasKeyboardShortcutKey(' ')).toBe('Space')
    expect(getCanvasKeyboardShortcutChordKey({ key: 'K', shiftKey: true }))
      .toBe('shift+k')
    expect(formatCanvasKeyboardShortcutChord({ key: 'k', shiftKey: true }))
      .toBe('Shift+K')
    expect(formatCanvasKeyboardShortcutAriaKey({
      key: 'k',
      shiftKey: true,
    })).toBe('Shift+K')
    expect(reserveCanvasKeyboardShortcut(
      'select tool',
      { key: 'v' },
      { shiftInsensitive: true },
    )).toEqual([
      { label: 'select tool', shortcut: { key: 'v' } },
      { label: 'select tool', shortcut: { key: 'v', shiftKey: true } },
    ])
  })
})

function createKeyboardEvent(
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    altKey: false,
    code: 'KeyM',
    ctrlKey: false,
    key: 'm',
    metaKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as KeyboardEvent
}

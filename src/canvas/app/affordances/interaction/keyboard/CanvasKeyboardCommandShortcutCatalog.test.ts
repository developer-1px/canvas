import { describe, expect, it } from 'vitest'
import { CANVAS_KEYBOARD_COMMAND_SHORTCUTS } from './CanvasKeyboardCommandShortcutCatalog'

describe('CanvasKeyboardCommandShortcutCatalog', () => {
  it('owns built-in document command shortcut descriptors', () => {
    expect(CANVAS_KEYBOARD_COMMAND_SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'edit selection',
          shortcut: { key: 'Enter' },
          shortcutId: 'editSelection',
        }),
        expect.objectContaining({
          label: 'undo history',
          modifier: 'mod',
          shortcut: { key: 'z' },
          shortcutId: 'undo',
        }),
        expect.objectContaining({
          label: 'send to back',
          shortcut: { key: '[', shiftKey: true },
          shortcutId: 'sendToBack',
        }),
        expect.objectContaining({
          label: 'group selection',
          shortcut: { key: 'g' },
          shortcutId: 'group',
        }),
      ]),
    )
  })

  it('marks delete shortcuts as reserved for custom creation tool contracts', () => {
    const deleteShortcuts = CANVAS_KEYBOARD_COMMAND_SHORTCUTS.filter(
      (shortcut) => shortcut.shortcutId === 'delete',
    )

    expect(deleteShortcuts).toHaveLength(2)
    expect(deleteShortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reserve: { shiftInsensitive: true },
          shortcut: { key: 'Delete' },
        }),
        expect.objectContaining({
          reserve: { shiftInsensitive: true },
          shortcut: { key: 'Backspace' },
        }),
      ]),
    )
  })
})

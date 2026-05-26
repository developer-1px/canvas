import { describe, expect, it } from 'vitest'
import {
  CANVAS_KEYBOARD_SYSTEM_SHORTCUTS,
  CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT,
} from './CanvasKeyboardSystemShortcutCatalog'

describe('CanvasKeyboardSystemShortcutCatalog', () => {
  it('owns built-in system shortcut descriptors', () => {
    expect(CANVAS_KEYBOARD_SYSTEM_SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'find replace',
          modifier: 'mod',
          overlayId: 'findReplace',
          phase: 'before-typing-target',
          shortcut: { key: 'f' },
          shortcutId: 'findReplace',
        }),
        expect.objectContaining({
          label: 'cursor chat',
          overlayId: 'cursorChat',
          phase: 'after-typing-target',
          shortcut: { key: '/' },
          shortcutId: 'cursorChat',
        }),
        expect.objectContaining({
          label: 'escape',
          phase: 'after-typing-target',
          shortcut: { key: 'Escape' },
          shortcutId: 'escape',
        }),
      ]),
    )
  })

  it('marks temporary pan and escape as reserved for custom tool contracts', () => {
    expect(CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT).toMatchObject({
      code: 'Space',
      gestureId: 'temporaryPan',
      label: 'temporary pan',
      reserve: { shiftInsensitive: true },
      shortcut: { key: 'Space' },
      shortcutId: 'temporaryPan',
    })

    expect(CANVAS_KEYBOARD_SYSTEM_SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'cursor chat',
          reserve: {},
          shortcut: { key: '/' },
        }),
        expect.objectContaining({
          label: 'escape',
          reserve: { shiftInsensitive: true },
          shortcut: { key: 'Escape' },
        }),
      ]),
    )
  })
})

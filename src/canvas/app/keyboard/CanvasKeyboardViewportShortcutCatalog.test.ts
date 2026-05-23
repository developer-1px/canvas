import { describe, expect, it } from 'vitest'
import { CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS } from './CanvasKeyboardViewportShortcutCatalog'

describe('CanvasKeyboardViewportShortcutCatalog', () => {
  it('owns built-in viewport shortcut descriptors', () => {
    expect(CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          commandId: 'zoomIn',
          keys: ['=', '+'],
          label: 'zoom in',
          modifier: 'mod',
          shortcut: { key: '=' },
          shortcutId: 'zoomIn',
        }),
        expect.objectContaining({
          commandId: 'zoomReset',
          label: 'reset viewport',
          shortcut: { key: '0' },
          shortcutId: 'zoomReset',
        }),
        expect.objectContaining({
          commandId: 'fitView',
          label: 'fit selection',
          shortcut: { key: '1' },
          shortcutId: 'fitSelection',
        }),
      ]),
    )
  })

  it('marks fit shortcuts as reserved for custom creation tool contracts', () => {
    const fitShortcuts = CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS.filter(
      (shortcut) => shortcut.commandId === 'fitView',
    )

    expect(fitShortcuts).toHaveLength(2)
    expect(fitShortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'fit all',
          reserve: true,
          shortcut: { key: '0' },
        }),
        expect.objectContaining({
          label: 'fit selection',
          reserve: true,
          shortcut: { key: '1' },
        }),
      ]),
    )
  })
})

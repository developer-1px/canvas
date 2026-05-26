import { describe, expect, it } from 'vitest'
import { CANVAS_KEYBOARD_NUDGE_SHORTCUTS } from './CanvasKeyboardNudgeShortcutCatalog'

describe('CanvasKeyboardNudgeShortcutCatalog', () => {
  it('owns built-in nudge shortcut descriptors', () => {
    expect(CANVAS_KEYBOARD_NUDGE_SHORTCUTS).toEqual(
      expect.arrayContaining([
        {
          dx: -1,
          dy: 0,
          label: 'nudge left',
          shortcut: { key: 'ArrowLeft' },
        },
        {
          dx: 0,
          dy: -10,
          label: 'large nudge up',
          shortcut: { key: 'ArrowUp', shiftKey: true },
        },
      ]),
    )
  })

  it('keeps every arrow direction available at normal and large steps', () => {
    expect(CANVAS_KEYBOARD_NUDGE_SHORTCUTS).toHaveLength(8)
    expect(CANVAS_KEYBOARD_NUDGE_SHORTCUTS.map(({ shortcut }) => shortcut))
      .toEqual(
        expect.arrayContaining([
          { key: 'ArrowLeft' },
          { key: 'ArrowRight' },
          { key: 'ArrowUp' },
          { key: 'ArrowDown' },
          { key: 'ArrowLeft', shiftKey: true },
          { key: 'ArrowRight', shiftKey: true },
          { key: 'ArrowUp', shiftKey: true },
          { key: 'ArrowDown', shiftKey: true },
        ]),
      )
  })
})

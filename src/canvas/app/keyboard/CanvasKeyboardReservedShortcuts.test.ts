import { describe, expect, it } from 'vitest'
import { getCanvasKeyboardReservedShortcuts } from './CanvasKeyboardReservedShortcuts'

describe('CanvasKeyboardReservedShortcuts', () => {
  it('combines built-in tool, command, navigation, and gesture shortcut reservations', () => {
    expect(getCanvasKeyboardReservedShortcuts()).toEqual(
      expect.arrayContaining([
        { label: 'select tool', shortcut: { key: 'v' } },
        { label: 'select tool', shortcut: { key: 'v', shiftKey: true } },
        { label: 'temporary pan', shortcut: { key: 'Space' } },
        {
          label: 'temporary pan',
          shortcut: { key: 'Space', shiftKey: true },
        },
        { label: 'fit all', shortcut: { key: '0' } },
        { label: 'fit selection', shortcut: { key: '1' } },
        { label: 'cursor chat', shortcut: { key: '/' } },
        { label: 'delete', shortcut: { key: 'Delete' } },
        {
          label: 'large nudge left',
          shortcut: { key: 'ArrowLeft', shiftKey: true },
        },
      ]),
    )
  })
})

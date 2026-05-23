import {
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import { getCanvasKeyboardReservedToolShortcuts } from './CanvasKeyboardToolShortcuts'

export function getCanvasKeyboardReservedShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return [
    ...getCanvasKeyboardReservedToolShortcuts(),
    ...reserveCanvasKeyboardShortcut('temporary pan', { key: 'Space' }, {
      shiftInsensitive: true,
    }),
    { label: 'fit all', shortcut: { key: '0' } },
    { label: 'fit selection', shortcut: { key: '1' } },
    ...reserveCanvasKeyboardShortcut('escape', { key: 'Escape' }, {
      shiftInsensitive: true,
    }),
    ...reserveCanvasKeyboardShortcut('delete', { key: 'Delete' }, {
      shiftInsensitive: true,
    }),
    ...reserveCanvasKeyboardShortcut('delete', { key: 'Backspace' }, {
      shiftInsensitive: true,
    }),
    { label: 'nudge left', shortcut: { key: 'ArrowLeft' } },
    { label: 'nudge right', shortcut: { key: 'ArrowRight' } },
    { label: 'nudge up', shortcut: { key: 'ArrowUp' } },
    { label: 'nudge down', shortcut: { key: 'ArrowDown' } },
    {
      label: 'large nudge left',
      shortcut: { key: 'ArrowLeft', shiftKey: true },
    },
    {
      label: 'large nudge right',
      shortcut: { key: 'ArrowRight', shiftKey: true },
    },
    {
      label: 'large nudge up',
      shortcut: { key: 'ArrowUp', shiftKey: true },
    },
    {
      label: 'large nudge down',
      shortcut: { key: 'ArrowDown', shiftKey: true },
    },
  ]
}

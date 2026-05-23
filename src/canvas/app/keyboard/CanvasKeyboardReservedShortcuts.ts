import {
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import { getCanvasKeyboardReservedCommandShortcuts } from './CanvasKeyboardCommandShortcuts'
import { getCanvasKeyboardReservedToolShortcuts } from './CanvasKeyboardToolShortcuts'

export function getCanvasKeyboardReservedShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return [
    ...getCanvasKeyboardReservedToolShortcuts(),
    ...getCanvasKeyboardReservedCommandShortcuts(),
    ...reserveCanvasKeyboardShortcut('temporary pan', { key: 'Space' }, {
      shiftInsensitive: true,
    }),
    ...reserveCanvasKeyboardShortcut('escape', { key: 'Escape' }, {
      shiftInsensitive: true,
    }),
  ]
}

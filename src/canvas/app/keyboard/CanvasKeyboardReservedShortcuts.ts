import type { CanvasKeyboardReservedShortcut } from './CanvasKeyboardShortcutChords'
import { getCanvasKeyboardReservedCommandShortcuts } from './CanvasKeyboardCommandShortcuts'
import { getCanvasKeyboardReservedSystemShortcuts } from './CanvasKeyboardSystemShortcuts'
import { getCanvasKeyboardReservedToolShortcuts } from './CanvasKeyboardToolShortcuts'

export function getCanvasKeyboardReservedShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return [
    ...getCanvasKeyboardReservedToolShortcuts(),
    ...getCanvasKeyboardReservedCommandShortcuts(),
    ...getCanvasKeyboardReservedSystemShortcuts(),
  ]
}

import type { CanvasKeyboardReservedShortcut } from './CanvasKeyboardShortcutChords'
import { getCanvasKeyboardReservedCommandShortcuts } from './CanvasKeyboardCommandShortcuts'
import { getCanvasKeyboardReservedNudgeShortcuts } from './CanvasKeyboardNudgeShortcuts'
import { getCanvasKeyboardReservedSystemShortcuts } from './CanvasKeyboardSystemShortcuts'
import { getCanvasKeyboardReservedToolShortcuts } from './CanvasKeyboardToolShortcuts'
import { getCanvasKeyboardReservedViewportShortcuts } from './CanvasKeyboardViewportShortcuts'

export function getCanvasKeyboardReservedShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return [
    ...getCanvasKeyboardReservedToolShortcuts(),
    ...getCanvasKeyboardReservedCommandShortcuts(),
    ...getCanvasKeyboardReservedViewportShortcuts(),
    ...getCanvasKeyboardReservedNudgeShortcuts(),
    ...getCanvasKeyboardReservedSystemShortcuts(),
  ]
}

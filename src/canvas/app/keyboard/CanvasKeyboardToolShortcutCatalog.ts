import type { CanvasShortcutId } from '../../engine'
import {
  CANVAS_TOOL_AFFORDANCE_ORDER,
  CANVAS_TOOL_AFFORDANCES,
} from '../../engine'
import type { CanvasBuiltinTool } from '../../entities'
import type { CanvasKeyboardShortcutChord } from './CanvasKeyboardShortcutChords'

export type CanvasKeyboardToolShortcutDescriptor = {
  label: string
  shiftInsensitive?: boolean
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
  tool: CanvasBuiltinTool
}

export const CANVAS_KEYBOARD_TOOL_SHORTCUTS:
  readonly CanvasKeyboardToolShortcutDescriptor[] =
  CANVAS_TOOL_AFFORDANCE_ORDER.map(getCanvasKeyboardToolShortcut)

function getCanvasKeyboardToolShortcut(
  tool: CanvasBuiltinTool,
): CanvasKeyboardToolShortcutDescriptor {
  const affordance = CANVAS_TOOL_AFFORDANCES[tool]
  const keyboardShortcut = affordance.keyboardShortcut

  return {
    label: affordance.ariaLabel.toLowerCase(),
    shiftInsensitive: keyboardShortcut.shiftInsensitive,
    shortcut: toCanvasKeyboardShortcutChord(keyboardShortcut),
    shortcutId: keyboardShortcut.shortcutId,
    tool,
  }
}

function toCanvasKeyboardShortcutChord({
  key,
  shiftKey,
}: {
  key: string
  shiftKey?: boolean
}): CanvasKeyboardShortcutChord {
  return shiftKey === undefined ? { key } : { key, shiftKey }
}

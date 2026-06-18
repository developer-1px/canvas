import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import {
  CANVAS_KEYBOARD_NUDGE_SHORTCUTS,
  type CanvasKeyboardNudgeShortcutDescriptor,
} from './CanvasKeyboardNudgeShortcutCatalog'
import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardCommandShortcutIntentInput,
} from './CanvasKeyboardCommandShortcutIntent'

export const CANVAS_KEYBOARD_NUDGE_MODEL =
  'canvas-keyboard-nudge-shortcuts'
export const CANVAS_KEYBOARD_NUDGE_INTENT_MODEL =
  'canvas-keyboard-nudge-shortcut-intent'
export const CANVAS_KEYBOARD_NUDGE_KEYS =
  'ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown'
export const CANVAS_KEYBOARD_NUDGE_STEP = 1
export const CANVAS_KEYBOARD_NUDGE_LARGE_STEP = 10

export function getCanvasKeyboardNudgeShortcutIntent(
  input: CanvasKeyboardCommandShortcutIntentInput,
): CanvasKeyboardCommandShortcutIntent | null {
  if (!input.config.shortcuts.nudge || !input.config.commands.nudge) {
    return null
  }

  const shortcut = CANVAS_KEYBOARD_NUDGE_SHORTCUTS.find((shortcut) =>
    isCanvasKeyboardNudgeShortcutMatch(input, shortcut),
  )

  if (!shortcut) {
    return null
  }

  return input.selection.length === 0
    ? { kind: 'none', preventDefault: false }
    : {
        dx: shortcut.dx,
        dy: shortcut.dy,
        kind: 'nudge-selection',
        preventDefault: true,
      }
}

export function getCanvasKeyboardReservedNudgeShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return CANVAS_KEYBOARD_NUDGE_SHORTCUTS.flatMap((shortcut) =>
    reserveCanvasKeyboardShortcut(shortcut.label, shortcut.shortcut),
  )
}

function isCanvasKeyboardNudgeShortcutMatch(
  input: CanvasKeyboardCommandShortcutIntentInput,
  shortcut: CanvasKeyboardNudgeShortcutDescriptor,
) {
  return (
    isCanvasKeyboardNudgeShortcutKeyMatch(input.key, shortcut) &&
    input.event.shiftKey === (shortcut.shortcut.shiftKey ?? false)
  )
}

function isCanvasKeyboardNudgeShortcutKeyMatch(
  key: string,
  shortcut: CanvasKeyboardNudgeShortcutDescriptor,
) {
  return (
    normalizeCanvasKeyboardShortcutKey(key).toLowerCase() ===
    normalizeCanvasKeyboardShortcutKey(shortcut.shortcut.key).toLowerCase()
  )
}

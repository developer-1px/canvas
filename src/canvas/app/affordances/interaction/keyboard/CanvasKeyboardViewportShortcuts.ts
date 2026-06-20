import {
  matchesCanvasKeyboardShortcutBinding,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import {
  CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS,
  type CanvasKeyboardViewportShortcutDescriptor,
} from './CanvasKeyboardViewportShortcutCatalog'
import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardCommandShortcutIntentInput,
} from './CanvasKeyboardCommandShortcutIntent'

export const CANVAS_KEYBOARD_VIEWPORT_MODEL =
  'canvas-keyboard-viewport-shortcuts'
export const CANVAS_KEYBOARD_VIEWPORT_INTENT_MODEL =
  'canvas-keyboard-viewport-shortcut-intent'

export function getCanvasKeyboardViewportShortcutIntent(
  input: CanvasKeyboardCommandShortcutIntentInput,
): CanvasKeyboardCommandShortcutIntent | null {
  const viewportShortcut = CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS.find(
    (shortcut) => isCanvasKeyboardViewportShortcutMatch(input, shortcut),
  )

  return viewportShortcut?.getIntent(input) ?? null
}

export function getCanvasKeyboardReservedViewportShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS.flatMap((shortcut) => {
    if (!shortcut.reserve) {
      return []
    }

    return reserveCanvasKeyboardShortcut(
      shortcut.label,
      shortcut.shortcut,
      typeof shortcut.reserve === 'object' ? shortcut.reserve : {},
    )
  })
}

function isCanvasKeyboardViewportShortcutMatch(
  input: CanvasKeyboardCommandShortcutIntentInput,
  shortcut: CanvasKeyboardViewportShortcutDescriptor,
) {
  if (!input.config.shortcuts[shortcut.shortcutId]) {
    return false
  }

  if (!input.config.commands[shortcut.commandId]) {
    return false
  }

  return matchesCanvasKeyboardShortcutBinding({
    event: input.event,
    options: {
      key: input.key,
      keys: shortcut.keys,
      modifier: shortcut.modifier,
      shiftInsensitive: shortcut.shiftInsensitive,
    },
    shortcut: shortcut.shortcut,
  })
}

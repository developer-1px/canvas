import {
  normalizeCanvasKeyboardShortcutKey,
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

  if (shortcut.modifier === 'mod' && !input.mod) {
    return false
  }

  if (!isCanvasKeyboardViewportShortcutKeyMatch(input.key, shortcut)) {
    return false
  }

  if (shortcut.shiftInsensitive) {
    return true
  }

  return input.event.shiftKey === (shortcut.shortcut.shiftKey ?? false)
}

function isCanvasKeyboardViewportShortcutKeyMatch(
  key: string,
  shortcut: CanvasKeyboardViewportShortcutDescriptor,
) {
  const normalizedKey = normalizeCanvasKeyboardShortcutKey(key).toLowerCase()
  const shortcutKeys = shortcut.keys ?? [shortcut.shortcut.key]

  return shortcutKeys.some(
    (shortcutKey) =>
      normalizeCanvasKeyboardShortcutKey(shortcutKey).toLowerCase() ===
      normalizedKey,
  )
}

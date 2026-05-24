import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import {
  CANVAS_KEYBOARD_COMMAND_SHORTCUTS,
  type CanvasKeyboardCommandShortcutDescriptor,
} from './CanvasKeyboardCommandShortcutCatalog'
import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardCommandShortcutIntentInput,
} from './CanvasKeyboardCommandShortcutIntent'

export function getCanvasKeyboardBuiltinCommandShortcutIntent(
  input: CanvasKeyboardCommandShortcutIntentInput,
): CanvasKeyboardCommandShortcutIntent | null {
  const commandShortcut = CANVAS_KEYBOARD_COMMAND_SHORTCUTS.find((shortcut) =>
    isCanvasKeyboardCommandShortcutMatch(input, shortcut),
  )

  return commandShortcut?.getIntent(input) ?? null
}

export function getCanvasKeyboardReservedCommandShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return CANVAS_KEYBOARD_COMMAND_SHORTCUTS.flatMap((shortcut) => {
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

function isCanvasKeyboardCommandShortcutMatch(
  input: CanvasKeyboardCommandShortcutIntentInput,
  shortcut: CanvasKeyboardCommandShortcutDescriptor,
) {
  if (!input.config.shortcuts[shortcut.shortcutId]) {
    return false
  }

  if (
    (shortcut.phase ?? 'after-typing-target') !==
    (input.phase ?? 'after-typing-target')
  ) {
    return false
  }

  if (shortcut.commandId && !input.config.commands[shortcut.commandId]) {
    return false
  }

  if (shortcut.modifier === 'mod' && !input.mod) {
    return false
  }

  if (shortcut.code && input.event.code !== shortcut.code) {
    return false
  }

  if (
    !shortcut.ignoreKey &&
    !isCanvasKeyboardShortcutKeyMatch(input.key, shortcut)
  ) {
    return false
  }

  if (shortcut.shiftInsensitive) {
    return true
  }

  return input.event.shiftKey === (shortcut.shortcut.shiftKey ?? false)
}

function isCanvasKeyboardShortcutKeyMatch(
  key: string,
  shortcut: CanvasKeyboardCommandShortcutDescriptor,
) {
  return (
    normalizeCanvasKeyboardShortcutKey(key).toLowerCase() ===
    normalizeCanvasKeyboardShortcutKey(shortcut.shortcut.key).toLowerCase()
  )
}

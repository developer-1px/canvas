import {
  matchesCanvasKeyboardShortcutBinding,
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

export const CANVAS_KEYBOARD_COMMAND_INTENT_MODEL =
  'canvas-keyboard-command-shortcut-intent'

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

  return matchesCanvasKeyboardShortcutBinding({
    event: input.event,
    options: {
      code: shortcut.code,
      ignoreKey: shortcut.ignoreKey,
      key: input.key,
      modifier: shortcut.modifier,
      shiftInsensitive: shortcut.shiftInsensitive,
    },
    shortcut: shortcut.shortcut,
  })
}

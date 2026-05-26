import type {
  CanvasAffordanceConfig,
} from '../../../engine'
import type { Tool } from '../../../entities'
import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import {
  CANVAS_KEYBOARD_TOOL_SHORTCUTS,
  type CanvasKeyboardToolShortcutDescriptor,
} from './CanvasKeyboardToolShortcutCatalog'

export function getCanvasKeyboardBuiltinToolShortcut({
  config,
  event,
  key,
}: {
  config: CanvasAffordanceConfig
  event: KeyboardEvent
  key: string
}): Tool | null {
  const toolShortcut = CANVAS_KEYBOARD_TOOL_SHORTCUTS.find((shortcut) =>
    isCanvasKeyboardToolShortcutMatch({ config, event, key, shortcut }),
  )

  return toolShortcut?.tool ?? null
}

export function getCanvasKeyboardReservedToolShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return CANVAS_KEYBOARD_TOOL_SHORTCUTS.flatMap((shortcut) =>
    reserveCanvasKeyboardShortcut(
      shortcut.label,
      shortcut.shortcut,
      {
        shiftInsensitive: shortcut.shiftInsensitive,
      },
    ),
  )
}

function isCanvasKeyboardToolShortcutMatch({
  config,
  event,
  key,
  shortcut,
}: {
  config: CanvasAffordanceConfig
  event: KeyboardEvent
  key: string
  shortcut: CanvasKeyboardToolShortcutDescriptor
}) {
  if (
    !config.shortcuts[shortcut.shortcutId] ||
    !config.tools[shortcut.tool]
  ) {
    return false
  }

  if (
    key !== normalizeCanvasKeyboardShortcutKey(shortcut.shortcut.key)
      .toLowerCase()
  ) {
    return false
  }

  if (shortcut.shiftInsensitive) {
    return true
  }

  return event.shiftKey === (shortcut.shortcut.shiftKey ?? false)
}

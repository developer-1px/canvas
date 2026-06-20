import type {
  CanvasAffordanceConfig,
} from '../../../../engine'
import type {
  CanvasBuiltinTool,
  Tool,
} from '../../../../entities'
import {
  formatCanvasKeyboardShortcutAriaKey,
  matchesCanvasKeyboardShortcutBinding,
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

export function getCanvasKeyboardToolAriaKeyshortcuts({
  config,
  tool,
}: {
  config: CanvasAffordanceConfig
  tool: CanvasBuiltinTool
}) {
  const shortcut = CANVAS_KEYBOARD_TOOL_SHORTCUTS.find((candidate) =>
    candidate.tool === tool &&
      config.shortcuts[candidate.shortcutId] &&
      config.tools[candidate.tool]
  )

  return shortcut
    ? formatCanvasKeyboardShortcutAriaKey(shortcut.shortcut)
    : undefined
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

  return matchesCanvasKeyboardShortcutBinding({
    event,
    options: {
      key,
      shiftInsensitive: shortcut.shiftInsensitive,
    },
    shortcut: shortcut.shortcut,
  })
}

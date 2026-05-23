import type {
  CanvasAffordanceConfig,
  CanvasToolKeyboardShortcut,
} from '../../engine'
import {
  CANVAS_TOOL_AFFORDANCE_ORDER,
  CANVAS_TOOL_AFFORDANCES,
} from '../../engine'
import type {
  CanvasBuiltinTool,
  Tool,
} from '../../entities'
import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
  type CanvasKeyboardShortcutChord,
} from './CanvasKeyboardShortcutChords'

type CanvasKeyboardToolShortcut = {
  label: string
  shortcut: CanvasToolKeyboardShortcut
  shiftInsensitive?: boolean
  tool: CanvasBuiltinTool
}

const CANVAS_KEYBOARD_TOOL_SHORTCUTS =
  CANVAS_TOOL_AFFORDANCE_ORDER.map(getCanvasKeyboardToolShortcut)

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
      toCanvasKeyboardShortcutChord(shortcut.shortcut),
      {
        shiftInsensitive: shortcut.shiftInsensitive,
      },
    ),
  )
}

function getCanvasKeyboardToolShortcut(
  tool: CanvasBuiltinTool,
): CanvasKeyboardToolShortcut {
  const affordance = CANVAS_TOOL_AFFORDANCES[tool]
  const keyboardShortcut: CanvasToolKeyboardShortcut =
    affordance.keyboardShortcut

  return {
    label: affordance.ariaLabel.toLowerCase(),
    shortcut: keyboardShortcut,
    shiftInsensitive: keyboardShortcut.shiftInsensitive,
    tool,
  }
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
  shortcut: CanvasKeyboardToolShortcut
}) {
  if (
    !config.shortcuts[shortcut.shortcut.shortcutId] ||
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

function toCanvasKeyboardShortcutChord(
  shortcut: CanvasToolKeyboardShortcut,
): CanvasKeyboardShortcutChord {
  return shortcut.shiftKey === undefined
    ? { key: shortcut.key }
    : { key: shortcut.key, shiftKey: shortcut.shiftKey }
}

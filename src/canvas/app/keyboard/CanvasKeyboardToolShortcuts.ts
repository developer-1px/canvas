import type {
  CanvasAffordanceConfig,
  CanvasShortcutId,
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
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
  shiftInsensitive?: boolean
  tool: CanvasBuiltinTool
}

const CANVAS_KEYBOARD_TOOL_SHORTCUTS = [
  {
    label: 'select tool',
    shortcut: { key: 'v' },
    shortcutId: 'selectTool',
    shiftInsensitive: true,
    tool: 'select',
  },
  {
    label: 'pan tool',
    shortcut: { key: 'h' },
    shortcutId: 'panTool',
    shiftInsensitive: true,
    tool: 'pan',
  },
  {
    label: 'highlighter tool',
    shortcut: { key: 'm', shiftKey: true },
    shortcutId: 'highlighterTool',
    tool: 'highlight',
  },
  {
    label: 'marker tool',
    shortcut: { key: 'm' },
    shortcutId: 'markerTool',
    tool: 'marker',
  },
  {
    label: 'arrow tool',
    shortcut: { key: 'l' },
    shortcutId: 'arrowTool',
    shiftInsensitive: true,
    tool: 'arrow',
  },
  {
    label: 'rectangle tool',
    shortcut: { key: 'r' },
    shortcutId: 'rectTool',
    shiftInsensitive: true,
    tool: 'rect',
  },
  {
    label: 'text tool',
    shortcut: { key: 't' },
    shortcutId: 'textTool',
    shiftInsensitive: true,
    tool: 'text',
  },
] satisfies readonly CanvasKeyboardToolShortcut[]

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
    reserveCanvasKeyboardShortcut(shortcut.label, shortcut.shortcut, {
      shiftInsensitive: shortcut.shiftInsensitive,
    }),
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
  shortcut: CanvasKeyboardToolShortcut
}) {
  if (!config.shortcuts[shortcut.shortcutId] || !config.tools[shortcut.tool]) {
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

import type {
  CanvasCommandId,
  CanvasShortcutId,
} from '../../engine'
import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
  type CanvasKeyboardShortcutChord,
} from './CanvasKeyboardShortcutChords'
import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardCommandShortcutIntentInput,
} from './CanvasKeyboardCommandShortcutIntent'

type CanvasKeyboardCommandShortcutDescriptor = {
  code?: string
  commandId?: CanvasCommandId
  ignoreKey?: boolean
  getIntent: (
    input: CanvasKeyboardCommandShortcutIntentInput,
  ) => CanvasKeyboardCommandShortcutIntent
  label: string
  modifier?: 'mod'
  reserve?: boolean | { shiftInsensitive?: boolean }
  shiftInsensitive?: boolean
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
}

const CANVAS_KEYBOARD_COMMAND_SHORTCUTS:
  readonly CanvasKeyboardCommandShortcutDescriptor[] = [
  {
    commandId: 'delete',
    getIntent: () => ({ kind: 'delete-selection', preventDefault: true }),
    label: 'delete',
    reserve: { shiftInsensitive: true },
    shiftInsensitive: true,
    shortcut: { key: 'Delete' },
    shortcutId: 'delete',
  },
  {
    commandId: 'delete',
    getIntent: () => ({ kind: 'delete-selection', preventDefault: true }),
    label: 'delete',
    reserve: { shiftInsensitive: true },
    shiftInsensitive: true,
    shortcut: { key: 'Backspace' },
    shortcutId: 'delete',
  },
  {
    getIntent: () => ({ kind: 'undo-history', preventDefault: true }),
    label: 'undo history',
    modifier: 'mod',
    shortcut: { key: 'z' },
    shortcutId: 'undo',
  },
  {
    getIntent: () => ({ kind: 'redo-history', preventDefault: true }),
    label: 'redo history',
    modifier: 'mod',
    shortcut: { key: 'z', shiftKey: true },
    shortcutId: 'redo',
  },
  {
    getIntent: () => ({ kind: 'redo-history', preventDefault: true }),
    label: 'redo history',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: 'y' },
    shortcutId: 'redo',
  },
  {
    getIntent: () => ({ kind: 'copy-selection', preventDefault: true }),
    label: 'copy selection',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: 'c' },
    shortcutId: 'copy',
  },
  {
    getIntent: () => ({ kind: 'cut-selection', preventDefault: true }),
    label: 'cut selection',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: 'x' },
    shortcutId: 'cut',
  },
  {
    getIntent: () => ({ kind: 'paste-selection', preventDefault: true }),
    label: 'paste selection',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: 'v' },
    shortcutId: 'paste',
  },
  {
    getIntent: () => ({ kind: 'select-all', preventDefault: true }),
    label: 'select all',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: 'a' },
    shortcutId: 'selectAll',
  },
  {
    getIntent: () => ({ kind: 'duplicate-selection', preventDefault: true }),
    label: 'duplicate selection',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: 'd' },
    shortcutId: 'duplicate',
  },
  {
    getIntent: () => ({ kind: 'lock-selection', preventDefault: true }),
    label: 'lock selection',
    modifier: 'mod',
    shortcut: { key: 'l' },
    shortcutId: 'lockSelection',
  },
  {
    getIntent: () => ({ kind: 'unlock-all', preventDefault: true }),
    label: 'unlock all',
    modifier: 'mod',
    shortcut: { key: 'l', shiftKey: true },
    shortcutId: 'unlockAll',
  },
  {
    code: 'BracketRight',
    getIntent: () => ({
      kind: 'reorder-selection',
      mode: 'bringForward',
      preventDefault: true,
    }),
    ignoreKey: true,
    label: 'bring forward',
    modifier: 'mod',
    shortcut: { key: ']' },
    shortcutId: 'bringForward',
  },
  {
    code: 'BracketRight',
    getIntent: () => ({
      kind: 'reorder-selection',
      mode: 'bringToFront',
      preventDefault: true,
    }),
    ignoreKey: true,
    label: 'bring to front',
    modifier: 'mod',
    shortcut: { key: ']', shiftKey: true },
    shortcutId: 'bringToFront',
  },
  {
    code: 'BracketLeft',
    getIntent: () => ({
      kind: 'reorder-selection',
      mode: 'sendBackward',
      preventDefault: true,
    }),
    ignoreKey: true,
    label: 'send backward',
    modifier: 'mod',
    shortcut: { key: '[' },
    shortcutId: 'sendBackward',
  },
  {
    code: 'BracketLeft',
    getIntent: () => ({
      kind: 'reorder-selection',
      mode: 'sendToBack',
      preventDefault: true,
    }),
    ignoreKey: true,
    label: 'send to back',
    modifier: 'mod',
    shortcut: { key: '[', shiftKey: true },
    shortcutId: 'sendToBack',
  },
  {
    getIntent: () => ({ kind: 'group-selection', preventDefault: true }),
    label: 'group selection',
    modifier: 'mod',
    shortcut: { key: 'g' },
    shortcutId: 'group',
  },
  {
    getIntent: () => ({ kind: 'ungroup-selection', preventDefault: true }),
    label: 'ungroup selection',
    modifier: 'mod',
    shortcut: { key: 'g', shiftKey: true },
    shortcutId: 'ungroup',
  },
]

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

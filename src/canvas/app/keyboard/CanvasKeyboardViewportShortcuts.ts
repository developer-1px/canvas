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

type CanvasKeyboardViewportShortcutDescriptor = {
  commandId: CanvasCommandId
  getIntent: (
    input: CanvasKeyboardCommandShortcutIntentInput,
  ) => CanvasKeyboardCommandShortcutIntent
  keys?: readonly string[]
  label: string
  modifier?: 'mod'
  reserve?: boolean | { shiftInsensitive?: boolean }
  shiftInsensitive?: boolean
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
}

const CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS:
  readonly CanvasKeyboardViewportShortcutDescriptor[] = [
  {
    commandId: 'zoomIn',
    getIntent: () => ({
      kind: 'zoom-by',
      multiplier: 1.25,
      preventDefault: true,
    }),
    keys: ['=', '+'],
    label: 'zoom in',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: '=' },
    shortcutId: 'zoomIn',
  },
  {
    commandId: 'zoomOut',
    getIntent: () => ({
      kind: 'zoom-by',
      multiplier: 0.8,
      preventDefault: true,
    }),
    label: 'zoom out',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: '-' },
    shortcutId: 'zoomOut',
  },
  {
    commandId: 'zoomReset',
    getIntent: () => ({ kind: 'reset-viewport', preventDefault: true }),
    label: 'reset viewport',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: '0' },
    shortcutId: 'zoomReset',
  },
  {
    commandId: 'fitView',
    getIntent: () => ({ kind: 'fit-all', preventDefault: true }),
    label: 'fit all',
    reserve: true,
    shiftInsensitive: true,
    shortcut: { key: '0' },
    shortcutId: 'fitAll',
  },
  {
    commandId: 'fitView',
    getIntent: ({ selection }) => ({
      ids: selection.length > 0 ? [...selection] : undefined,
      kind: 'fit-selection',
      preventDefault: true,
    }),
    label: 'fit selection',
    reserve: true,
    shiftInsensitive: true,
    shortcut: { key: '1' },
    shortcutId: 'fitSelection',
  },
]

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

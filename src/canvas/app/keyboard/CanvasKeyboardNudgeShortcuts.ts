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

type CanvasKeyboardNudgeShortcutDescriptor = {
  dx: number
  dy: number
  label: string
  shortcut: CanvasKeyboardShortcutChord
}

const CANVAS_KEYBOARD_NUDGE_SHORTCUTS = [
  {
    dx: -1,
    dy: 0,
    label: 'nudge left',
    shortcut: { key: 'ArrowLeft' },
  },
  {
    dx: 1,
    dy: 0,
    label: 'nudge right',
    shortcut: { key: 'ArrowRight' },
  },
  {
    dx: 0,
    dy: -1,
    label: 'nudge up',
    shortcut: { key: 'ArrowUp' },
  },
  {
    dx: 0,
    dy: 1,
    label: 'nudge down',
    shortcut: { key: 'ArrowDown' },
  },
  {
    dx: -10,
    dy: 0,
    label: 'large nudge left',
    shortcut: { key: 'ArrowLeft', shiftKey: true },
  },
  {
    dx: 10,
    dy: 0,
    label: 'large nudge right',
    shortcut: { key: 'ArrowRight', shiftKey: true },
  },
  {
    dx: 0,
    dy: -10,
    label: 'large nudge up',
    shortcut: { key: 'ArrowUp', shiftKey: true },
  },
  {
    dx: 0,
    dy: 10,
    label: 'large nudge down',
    shortcut: { key: 'ArrowDown', shiftKey: true },
  },
] satisfies readonly CanvasKeyboardNudgeShortcutDescriptor[]

export function getCanvasKeyboardNudgeShortcutIntent(
  input: CanvasKeyboardCommandShortcutIntentInput,
): CanvasKeyboardCommandShortcutIntent | null {
  if (!input.config.shortcuts.nudge || !input.config.commands.nudge) {
    return null
  }

  const shortcut = CANVAS_KEYBOARD_NUDGE_SHORTCUTS.find((shortcut) =>
    isCanvasKeyboardNudgeShortcutMatch(input, shortcut),
  )

  if (!shortcut) {
    return null
  }

  return input.selection.length === 0
    ? { kind: 'none', preventDefault: false }
    : {
        dx: shortcut.dx,
        dy: shortcut.dy,
        kind: 'nudge-selection',
        preventDefault: true,
      }
}

export function getCanvasKeyboardReservedNudgeShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return CANVAS_KEYBOARD_NUDGE_SHORTCUTS.flatMap((shortcut) =>
    reserveCanvasKeyboardShortcut(shortcut.label, shortcut.shortcut),
  )
}

function isCanvasKeyboardNudgeShortcutMatch(
  input: CanvasKeyboardCommandShortcutIntentInput,
  shortcut: CanvasKeyboardNudgeShortcutDescriptor,
) {
  return (
    isCanvasKeyboardNudgeShortcutKeyMatch(input.key, shortcut) &&
    input.event.shiftKey === (shortcut.shortcut.shiftKey ?? false)
  )
}

function isCanvasKeyboardNudgeShortcutKeyMatch(
  key: string,
  shortcut: CanvasKeyboardNudgeShortcutDescriptor,
) {
  return (
    normalizeCanvasKeyboardShortcutKey(key).toLowerCase() ===
    normalizeCanvasKeyboardShortcutKey(shortcut.shortcut.key).toLowerCase()
  )
}

import type {
  CanvasAffordanceConfig,
  CanvasGestureId,
  CanvasOverlayId,
  CanvasShortcutId,
} from '../../engine'
import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
  type CanvasKeyboardShortcutChord,
} from './CanvasKeyboardShortcutChords'

export type CanvasKeyboardSystemShortcutIntent =
  | { kind: 'open-find-replace'; preventDefault: true }
  | { kind: 'temporary-pan'; preventDefault: true }
  | { kind: 'escape'; preventDefault: false }

type CanvasKeyboardSystemShortcutPhase =
  | 'before-typing-target'
  | 'after-typing-target'

type CanvasKeyboardSystemShortcutInput = {
  config: CanvasAffordanceConfig
  event: globalThis.KeyboardEvent
  key: string
  mod: boolean
}

type CanvasKeyboardSystemShortcutDescriptor = {
  code?: string
  gestureId?: CanvasGestureId
  getIntent: () => CanvasKeyboardSystemShortcutIntent
  ignoreKey?: boolean
  label: string
  modifier?: 'mod'
  overlayId?: CanvasOverlayId
  phase: CanvasKeyboardSystemShortcutPhase
  reserve?: { shiftInsensitive?: boolean }
  shiftInsensitive?: boolean
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
}

const CANVAS_KEYBOARD_SYSTEM_SHORTCUTS = [
  {
    getIntent: () => ({ kind: 'open-find-replace', preventDefault: true }),
    label: 'find replace',
    modifier: 'mod',
    overlayId: 'findReplace',
    phase: 'before-typing-target',
    shiftInsensitive: true,
    shortcut: { key: 'f' },
    shortcutId: 'findReplace',
  },
  {
    code: 'Space',
    gestureId: 'temporaryPan',
    getIntent: () => ({ kind: 'temporary-pan', preventDefault: true }),
    ignoreKey: true,
    label: 'temporary pan',
    phase: 'after-typing-target',
    reserve: { shiftInsensitive: true },
    shiftInsensitive: true,
    shortcut: { key: 'Space' },
    shortcutId: 'temporaryPan',
  },
  {
    getIntent: () => ({ kind: 'escape', preventDefault: false }),
    label: 'escape',
    phase: 'after-typing-target',
    reserve: { shiftInsensitive: true },
    shiftInsensitive: true,
    shortcut: { key: 'Escape' },
    shortcutId: 'escape',
  },
] satisfies readonly CanvasKeyboardSystemShortcutDescriptor[]

export function getCanvasKeyboardSystemShortcutIntent(
  input: CanvasKeyboardSystemShortcutInput & {
    phase: CanvasKeyboardSystemShortcutPhase
  },
): CanvasKeyboardSystemShortcutIntent | null {
  const systemShortcut = CANVAS_KEYBOARD_SYSTEM_SHORTCUTS.find(
    (shortcut) =>
      shortcut.phase === input.phase &&
      isCanvasKeyboardSystemShortcutMatch(input, shortcut),
  )

  return systemShortcut?.getIntent() ?? null
}

export function getCanvasKeyboardReservedSystemShortcuts():
  CanvasKeyboardReservedShortcut[] {
  return CANVAS_KEYBOARD_SYSTEM_SHORTCUTS.flatMap((shortcut) => {
    if (!shortcut.reserve) {
      return []
    }

    return reserveCanvasKeyboardShortcut(
      shortcut.label,
      shortcut.shortcut,
      shortcut.reserve,
    )
  })
}

export function shouldReleaseCanvasKeyboardTemporaryPan({
  config,
  event,
}: {
  config: CanvasAffordanceConfig
  event: globalThis.KeyboardEvent
}) {
  return (
    config.shortcuts.temporaryPan &&
    config.gestures.temporaryPan &&
    event.code === 'Space'
  )
}

function isCanvasKeyboardSystemShortcutMatch(
  input: CanvasKeyboardSystemShortcutInput,
  shortcut: CanvasKeyboardSystemShortcutDescriptor,
) {
  if (!input.config.shortcuts[shortcut.shortcutId]) {
    return false
  }

  if (shortcut.gestureId && !input.config.gestures[shortcut.gestureId]) {
    return false
  }

  if (shortcut.overlayId && !input.config.overlays[shortcut.overlayId]) {
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
    normalizeCanvasKeyboardShortcutKey(input.key).toLowerCase() !==
      normalizeCanvasKeyboardShortcutKey(shortcut.shortcut.key).toLowerCase()
  ) {
    return false
  }

  if (shortcut.shiftInsensitive) {
    return true
  }

  return input.event.shiftKey === (shortcut.shortcut.shiftKey ?? false)
}

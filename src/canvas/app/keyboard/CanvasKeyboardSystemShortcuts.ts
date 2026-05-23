import type {
  CanvasAffordanceConfig,
} from '../../engine'
import {
  normalizeCanvasKeyboardShortcutKey,
  reserveCanvasKeyboardShortcut,
  type CanvasKeyboardReservedShortcut,
} from './CanvasKeyboardShortcutChords'
import {
  CANVAS_KEYBOARD_SYSTEM_SHORTCUTS,
  CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT,
  type CanvasKeyboardSystemShortcutDescriptor,
  type CanvasKeyboardSystemShortcutIntent,
  type CanvasKeyboardSystemShortcutPhase,
} from './CanvasKeyboardSystemShortcutCatalog'

export type { CanvasKeyboardSystemShortcutIntent } from './CanvasKeyboardSystemShortcutCatalog'

type CanvasKeyboardSystemShortcutInput = {
  config: CanvasAffordanceConfig
  event: globalThis.KeyboardEvent
  key: string
  mod: boolean
}

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
    config.shortcuts[CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT.shortcutId] &&
    config.gestures[CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT.gestureId] &&
    event.code === CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT.code
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

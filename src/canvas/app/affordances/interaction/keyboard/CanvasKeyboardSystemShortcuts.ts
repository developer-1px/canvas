import type {
  CanvasAffordanceConfig,
} from '../../../../engine'
import {
  matchesCanvasKeyboardShortcutBinding,
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

export const CANVAS_KEYBOARD_TEMPORARY_PAN_MODEL =
  'canvas-temporary-pan-shortcut'
export const CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT_LABEL =
  CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT.shortcut.key

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

import type { CanvasAffordanceConfig } from '../../../engine'
import { getCanvasKeyboardBuiltinCommandShortcutIntent } from './CanvasKeyboardCommandShortcuts'
import { getCanvasKeyboardNudgeShortcutIntent } from './CanvasKeyboardNudgeShortcuts'
import { getCanvasKeyboardViewportShortcutIntent } from './CanvasKeyboardViewportShortcuts'

export type CanvasKeyboardReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasKeyboardCommandShortcutIntent =
  | { kind: 'none'; preventDefault: false }
  | { kind: 'delete-selection'; preventDefault: true }
  | { kind: 'undo-history'; preventDefault: true }
  | { kind: 'redo-history'; preventDefault: true }
  | { kind: 'zoom-by'; multiplier: number; preventDefault: true }
  | { kind: 'reset-viewport'; preventDefault: true }
  | { kind: 'copy-selection'; preventDefault: true }
  | { kind: 'cut-selection'; preventDefault: true }
  | { kind: 'paste-selection'; preventDefault: true }
  | { kind: 'quick-create-sticky'; preventDefault: true }
  | { kind: 'select-all'; preventDefault: true }
  | { kind: 'duplicate-selection'; preventDefault: true }
  | { kind: 'lock-selection'; preventDefault: true }
  | { kind: 'unlock-all'; preventDefault: true }
  | {
      kind: 'reorder-selection'
      mode: CanvasKeyboardReorderMode
      preventDefault: true
    }
  | { kind: 'group-selection'; preventDefault: true }
  | { kind: 'ungroup-selection'; preventDefault: true }
  | { dx: number; dy: number; kind: 'nudge-selection'; preventDefault: true }
  | { kind: 'fit-all'; preventDefault: true }
  | {
      ids: string[] | undefined
      kind: 'fit-selection'
      preventDefault: true
    }

export type CanvasKeyboardCommandShortcutIntentInput = {
  config: CanvasAffordanceConfig
  event: globalThis.KeyboardEvent
  key: string
  mod: boolean
  phase?: CanvasKeyboardCommandShortcutPhase
  selection: readonly string[]
}

export type CanvasKeyboardCommandShortcutPhase =
  | 'after-typing-target'
  | 'before-typing-target'

export function getCanvasKeyboardCommandShortcutIntent({
  config,
  event,
  key,
  mod,
  phase = 'after-typing-target',
  selection,
}: CanvasKeyboardCommandShortcutIntentInput):
  CanvasKeyboardCommandShortcutIntent | null {
  const input = {
    config,
    event,
    key,
    mod,
    phase,
    selection,
  }

  if (phase === 'before-typing-target') {
    return getCanvasKeyboardBuiltinCommandShortcutIntent(input)
  }

  return getCanvasKeyboardBuiltinCommandShortcutIntent(input) ??
    getCanvasKeyboardViewportShortcutIntent(input) ??
    getCanvasKeyboardNudgeShortcutIntent(input)
}

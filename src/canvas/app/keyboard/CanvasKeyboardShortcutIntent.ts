import type { CanvasAffordanceConfig } from '../../engine'
import type { Tool } from '../../entities'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'
import {
  getCanvasKeyboardCommandShortcutIntent,
  type CanvasKeyboardCommandShortcutIntent,
  type CanvasKeyboardReorderMode,
} from './CanvasKeyboardCommandShortcutIntent'
import { getCanvasKeyboardToolShortcutIntent } from './CanvasKeyboardToolShortcutIntent'

export type { CanvasKeyboardReorderMode }

export type CanvasKeyboardShortcutIntent =
  | { kind: 'none'; preventDefault: false }
  | { kind: 'open-find-replace'; preventDefault: true }
  | { kind: 'temporary-pan'; preventDefault: true }
  | { kind: 'escape'; preventDefault: false }
  | CanvasKeyboardCommandShortcutIntent
  | { kind: 'set-tool'; preventDefault: false; tool: Tool }

export type CanvasKeyboardShortcutIntentInput = {
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  event: globalThis.KeyboardEvent
  selection: readonly string[]
}

export function getCanvasKeyboardShortcutIntent({
  config,
  customCreationTools,
  event,
  selection,
}: CanvasKeyboardShortcutIntentInput): CanvasKeyboardShortcutIntent {
  const key = event.key.toLowerCase()
  const mod = event.metaKey || event.ctrlKey

  if (mod && key === 'f') {
    return { kind: 'open-find-replace', preventDefault: true }
  }

  if (isCanvasKeyboardTypingTarget(event.target)) {
    return { kind: 'none', preventDefault: false }
  }

  if (
    config.shortcuts.temporaryPan &&
    config.gestures.temporaryPan &&
    event.code === 'Space'
  ) {
    return { kind: 'temporary-pan', preventDefault: true }
  }

  if (config.shortcuts.escape && event.key === 'Escape') {
    return { kind: 'escape', preventDefault: false }
  }

  const commandIntent = getCanvasKeyboardCommandShortcutIntent({
    config,
    event,
    key,
    mod,
    selection,
  })

  if (commandIntent) {
    return commandIntent
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return { kind: 'none', preventDefault: false }
  }

  const tool = getCanvasKeyboardToolShortcutIntent({
    config,
    customCreationTools,
    event,
    key,
  })

  return tool
    ? { kind: 'set-tool', preventDefault: false, tool }
    : { kind: 'none', preventDefault: false }
}

export function isCanvasKeyboardTypingTarget(target: EventTarget | null) {
  return (
    (typeof HTMLInputElement !== 'undefined' &&
      target instanceof HTMLInputElement) ||
    (typeof HTMLTextAreaElement !== 'undefined' &&
      target instanceof HTMLTextAreaElement) ||
    (typeof HTMLElement !== 'undefined' &&
      target instanceof HTMLElement &&
      target.isContentEditable)
  )
}

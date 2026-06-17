import type { CanvasAffordanceConfig } from '../../../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import type {
  CanvasKeyboardShortcutIntent,
} from './CanvasKeyboardShortcutIntentContracts'
import {
  getCanvasKeyboardCommandShortcutIntent,
} from './CanvasKeyboardCommandShortcutIntent'
import {
  getCanvasKeyboardSystemShortcutIntent,
} from './CanvasKeyboardSystemShortcuts'
import { getCanvasKeyboardToolShortcutIntent } from './CanvasKeyboardToolShortcutIntent'

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

  const preTypingSystemIntent = getCanvasKeyboardSystemShortcutIntent({
    config,
    event,
    key,
    mod,
    phase: 'before-typing-target',
  })

  if (preTypingSystemIntent) {
    return preTypingSystemIntent
  }

  const preTypingCommandIntent = getCanvasKeyboardCommandShortcutIntent({
    config,
    event,
    key,
    mod,
    phase: 'before-typing-target',
    selection,
  })

  if (preTypingCommandIntent) {
    return preTypingCommandIntent
  }

  if (isCanvasKeyboardTypingTarget(event.target)) {
    return { kind: 'none', preventDefault: false }
  }

  const systemIntent = getCanvasKeyboardSystemShortcutIntent({
    config,
    event,
    key,
    mod,
    phase: 'after-typing-target',
  })

  if (systemIntent) {
    return systemIntent
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
    (typeof HTMLSelectElement !== 'undefined' &&
      target instanceof HTMLSelectElement) ||
    (typeof HTMLElement !== 'undefined' &&
      target instanceof HTMLElement &&
      target.isContentEditable)
  )
}

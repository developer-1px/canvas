import type { CanvasAffordanceConfig } from '../../../../engine'
import { isCanvasNativeTextEntryTarget } from '../../../../browser-runtime/CanvasNativeGestureBoundary'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  getCanvasKeyboardCustomCommandShortcutIntent,
} from './CanvasKeyboardExtensionShortcutIntent'
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
  customCommands?: readonly CanvasAppCustomCommandState[]
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  event: globalThis.KeyboardEvent
  selection: readonly string[]
}

export function getCanvasKeyboardShortcutIntent({
  config,
  customCommands = [],
  customCreationTools,
  event,
  selection,
}: CanvasKeyboardShortcutIntentInput): CanvasKeyboardShortcutIntent {
  if (event.isComposing) {
    return { kind: 'none', preventDefault: false }
  }

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

  const customCommandId = getCanvasKeyboardCustomCommandShortcutIntent({
    customCommands,
    event,
  })

  if (customCommandId) {
    return {
      commandId: customCommandId,
      kind: 'run-custom-command',
      preventDefault: true,
    }
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
  return isCanvasNativeTextEntryTarget(target)
}

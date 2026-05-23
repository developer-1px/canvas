import type { CanvasAffordanceConfig } from '../../engine'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'
import { getCanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'
import {
  isCanvasKeyboardCommandIntent,
  runCanvasKeyboardCommandIntent,
  type CanvasKeyboardCommandHandlers,
} from './CanvasKeyboardCommandDispatch'
import {
  isCanvasKeyboardSystemIntent,
  runCanvasKeyboardSystemIntent,
  type CanvasKeyboardSystemHandlers,
} from './CanvasKeyboardSystemDispatch'
import {
  isCanvasKeyboardToolIntent,
  runCanvasKeyboardToolIntent,
  type CanvasKeyboardToolHandlers,
} from './CanvasKeyboardToolDispatch'
import {
  isCanvasKeyboardViewportIntent,
  runCanvasKeyboardViewportIntent,
  type CanvasKeyboardViewportHandlers,
} from './CanvasKeyboardViewportDispatch'

export type CanvasKeyboardShortcutHandlers =
  CanvasKeyboardCommandHandlers &
  CanvasKeyboardSystemHandlers &
  CanvasKeyboardToolHandlers &
  CanvasKeyboardViewportHandlers & {
    config: CanvasAffordanceConfig
    customCreationTools: readonly CanvasAppCustomCreationToolState[]
    selection: string[]
  }

export function handleCanvasKeyboardShortcut(
  event: globalThis.KeyboardEvent,
  handlers: CanvasKeyboardShortcutHandlers,
) {
  const intent = getCanvasKeyboardShortcutIntent({
    config: handlers.config,
    customCreationTools: handlers.customCreationTools,
    event,
    selection: handlers.selection,
  })

  if (intent.preventDefault) {
    event.preventDefault()
  }

  if (isCanvasKeyboardCommandIntent(intent)) {
    runCanvasKeyboardCommandIntent({ handlers, intent })
    return
  }

  if (isCanvasKeyboardSystemIntent(intent)) {
    runCanvasKeyboardSystemIntent({ handlers, intent })
    return
  }

  if (isCanvasKeyboardViewportIntent(intent)) {
    runCanvasKeyboardViewportIntent({ handlers, intent })
    return
  }

  if (isCanvasKeyboardToolIntent(intent)) {
    runCanvasKeyboardToolIntent({ handlers, intent })
    return
  }

  if (intent.kind === 'none') {
    return
  }

  return assertUnhandledCanvasKeyboardShortcutIntent(intent)
}

function assertUnhandledCanvasKeyboardShortcutIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard shortcut intent: ${String(intent)}`)
}

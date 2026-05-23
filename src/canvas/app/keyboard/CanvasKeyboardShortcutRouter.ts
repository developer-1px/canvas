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
  isCanvasKeyboardViewportIntent,
  runCanvasKeyboardViewportIntent,
  type CanvasKeyboardViewportHandlers,
} from './CanvasKeyboardViewportDispatch'

export type CanvasKeyboardShortcutHandlers =
  CanvasKeyboardCommandHandlers &
  CanvasKeyboardSystemHandlers &
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

  switch (intent.kind) {
    case 'none':
      return
    case 'set-tool':
      handlers.setTool(intent.tool)
      return
  }

  return assertUnhandledCanvasKeyboardShortcutIntent(intent)
}

function assertUnhandledCanvasKeyboardShortcutIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard shortcut intent: ${String(intent)}`)
}

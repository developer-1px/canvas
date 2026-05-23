import {
  isCanvasKeyboardCommandIntent,
  runCanvasKeyboardCommandIntent,
  type CanvasKeyboardCommandHandlers,
} from './CanvasKeyboardCommandDispatch'
import type { CanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'
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

export type CanvasKeyboardShortcutDispatchHandlers =
  CanvasKeyboardCommandHandlers &
  CanvasKeyboardSystemHandlers &
  CanvasKeyboardToolHandlers &
  CanvasKeyboardViewportHandlers

export function runCanvasKeyboardShortcutIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardShortcutDispatchHandlers
  intent: CanvasKeyboardShortcutIntent
}) {
  if (isCanvasKeyboardCommandIntent(intent)) {
    runCanvasKeyboardCommandIntent({ handlers, intent })
    return true
  }

  if (isCanvasKeyboardSystemIntent(intent)) {
    runCanvasKeyboardSystemIntent({ handlers, intent })
    return true
  }

  if (isCanvasKeyboardViewportIntent(intent)) {
    runCanvasKeyboardViewportIntent({ handlers, intent })
    return true
  }

  if (isCanvasKeyboardToolIntent(intent)) {
    runCanvasKeyboardToolIntent({ handlers, intent })
    return true
  }

  if (intent.kind === 'none') {
    return false
  }

  return assertUnhandledCanvasKeyboardShortcutIntent(intent)
}

function assertUnhandledCanvasKeyboardShortcutIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard shortcut intent: ${String(intent)}`)
}

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

export type CanvasKeyboardShortcutHandlers =
  CanvasKeyboardCommandHandlers &
  CanvasKeyboardSystemHandlers & {
    config: CanvasAffordanceConfig
    customCreationTools: readonly CanvasAppCustomCreationToolState[]
    fitToItems: (ids?: string[]) => void
    resetViewport: () => void
    selection: string[]
    zoomBy: (multiplier: number) => void
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

  switch (intent.kind) {
    case 'none':
      return
    case 'zoom-by':
      handlers.zoomBy(intent.multiplier)
      return
    case 'reset-viewport':
      handlers.resetViewport()
      return
    case 'fit-all':
      handlers.fitToItems()
      return
    case 'fit-selection':
      handlers.fitToItems(intent.ids)
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

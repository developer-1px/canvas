import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'
import type { CanvasViewportZoomDirection } from '../../../../core'
import type {
  CanvasKeyboardShortcutIntent,
} from './CanvasKeyboardShortcutIntentContracts'

export type CanvasKeyboardViewportHandlers = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoom: (direction: CanvasViewportZoomDirection) => void
}

const CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH =
  createCanvasKeyboardIntentDispatchTable<
    CanvasKeyboardShortcutIntent,
    CanvasKeyboardViewportHandlers
  >()({
    'fit-all': ({ handlers }) => {
      handlers.fitToItems()
    },
    'fit-selection': ({ handlers, intent }) => {
      handlers.fitToItems(intent.ids)
    },
    'reset-viewport': ({ handlers }) => {
      handlers.resetViewport()
    },
    'zoom-viewport': ({ handlers, intent }) => {
      handlers.zoom(intent.direction)
    },
  })

type CanvasKeyboardViewportIntentKind = Extract<
  keyof typeof CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH.runners,
  CanvasKeyboardShortcutIntent['kind']
>

export type CanvasKeyboardViewportIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardViewportIntentKind }
>

export function isCanvasKeyboardViewportIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardViewportIntent {
  return CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH.hasKind(intent.kind)
}

export function runCanvasKeyboardViewportIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardViewportHandlers
  intent: CanvasKeyboardViewportIntent
}) {
  CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH.run({ handlers, intent })
}

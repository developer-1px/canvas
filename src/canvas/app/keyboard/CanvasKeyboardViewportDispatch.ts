import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'
import type { CanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardViewportHandlers = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
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
    'zoom-by': ({ handlers, intent }) => {
      handlers.zoomBy(intent.multiplier)
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

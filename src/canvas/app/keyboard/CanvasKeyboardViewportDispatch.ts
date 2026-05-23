import type { CanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardViewportHandlers = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
}

type CanvasKeyboardViewportIntentKind =
  | 'fit-all'
  | 'fit-selection'
  | 'reset-viewport'
  | 'zoom-by'

export type CanvasKeyboardViewportIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardViewportIntentKind }
>

const CANVAS_KEYBOARD_VIEWPORT_INTENT_KINDS = Object.freeze([
  'fit-all',
  'fit-selection',
  'reset-viewport',
  'zoom-by',
] satisfies readonly CanvasKeyboardViewportIntentKind[])

export function isCanvasKeyboardViewportIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardViewportIntent {
  return CANVAS_KEYBOARD_VIEWPORT_INTENT_KINDS.includes(
    intent.kind as CanvasKeyboardViewportIntentKind,
  )
}

export function runCanvasKeyboardViewportIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardViewportHandlers
  intent: CanvasKeyboardViewportIntent
}) {
  switch (intent.kind) {
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
  }

  return assertUnhandledCanvasKeyboardViewportIntent(intent)
}

function assertUnhandledCanvasKeyboardViewportIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard viewport intent: ${String(intent)}`)
}

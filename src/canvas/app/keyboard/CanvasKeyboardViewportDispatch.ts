import type { CanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardViewportHandlers = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoomBy: (multiplier: number) => void
}

type CanvasKeyboardViewportShortcutIntentKind =
  CanvasKeyboardShortcutIntent['kind']

type CanvasKeyboardViewportIntentRunner<
  TKind extends CanvasKeyboardViewportShortcutIntentKind,
> = (args: {
  handlers: CanvasKeyboardViewportHandlers
  intent: Extract<CanvasKeyboardShortcutIntent, { kind: TKind }>
}) => void

function defineCanvasKeyboardViewportIntentRunners<
  const TRunners extends Partial<{
    [TKind in CanvasKeyboardViewportShortcutIntentKind]:
      CanvasKeyboardViewportIntentRunner<TKind>
  }>,
>(runners: TRunners) {
  return Object.freeze(runners)
}

const CANVAS_KEYBOARD_VIEWPORT_INTENT_RUNNERS =
  defineCanvasKeyboardViewportIntentRunners({
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
  keyof typeof CANVAS_KEYBOARD_VIEWPORT_INTENT_RUNNERS,
  CanvasKeyboardViewportShortcutIntentKind
>

type CanvasKeyboardAnyViewportIntentRunner =
  CanvasKeyboardViewportIntentRunner<CanvasKeyboardViewportIntentKind>

function hasCanvasKeyboardViewportIntentRunner(
  kind: string,
): kind is CanvasKeyboardViewportIntentKind {
  return Object.prototype.hasOwnProperty.call(
    CANVAS_KEYBOARD_VIEWPORT_INTENT_RUNNERS,
    kind,
  )
}

function getCanvasKeyboardViewportIntentRunner(
  kind: CanvasKeyboardViewportIntentKind,
): CanvasKeyboardAnyViewportIntentRunner {
  return CANVAS_KEYBOARD_VIEWPORT_INTENT_RUNNERS[
    kind
  ] as CanvasKeyboardAnyViewportIntentRunner
}

export type CanvasKeyboardViewportIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardViewportIntentKind }
>

export function isCanvasKeyboardViewportIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardViewportIntent {
  return hasCanvasKeyboardViewportIntentRunner(intent.kind)
}

export function runCanvasKeyboardViewportIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardViewportHandlers
  intent: CanvasKeyboardViewportIntent
}) {
  getCanvasKeyboardViewportIntentRunner(intent.kind)({ handlers, intent })
}

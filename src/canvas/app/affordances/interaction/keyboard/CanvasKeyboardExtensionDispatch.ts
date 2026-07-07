import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'
import type {
  CanvasKeyboardShortcutIntent,
} from './CanvasKeyboardShortcutIntentContracts'

export type CanvasKeyboardExtensionHandlers = {
  runCustomCommand: (commandId: string) => void
}

const CANVAS_KEYBOARD_EXTENSION_INTENT_DISPATCH =
  createCanvasKeyboardIntentDispatchTable<
    CanvasKeyboardShortcutIntent,
    CanvasKeyboardExtensionHandlers
  >()({
    'run-custom-command': ({ handlers, intent }) => {
      handlers.runCustomCommand(intent.commandId)
    },
  })

type CanvasKeyboardExtensionIntentKind = Extract<
  keyof typeof CANVAS_KEYBOARD_EXTENSION_INTENT_DISPATCH.runners,
  CanvasKeyboardShortcutIntent['kind']
>

export type CanvasKeyboardExtensionIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardExtensionIntentKind }
>

export function isCanvasKeyboardExtensionIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardExtensionIntent {
  return CANVAS_KEYBOARD_EXTENSION_INTENT_DISPATCH.hasKind(intent.kind)
}

export function runCanvasKeyboardExtensionIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardExtensionHandlers
  intent: CanvasKeyboardExtensionIntent
}) {
  CANVAS_KEYBOARD_EXTENSION_INTENT_DISPATCH.run({ handlers, intent })
}

import type { Tool } from '../../../entities'
import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'
import type {
  CanvasKeyboardShortcutIntent,
} from './CanvasKeyboardShortcutIntentContracts'

export type CanvasKeyboardToolHandlers = {
  setTool: (tool: Tool) => void
}

const CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH =
  createCanvasKeyboardIntentDispatchTable<
    CanvasKeyboardShortcutIntent,
    CanvasKeyboardToolHandlers
  >()({
    'set-tool': ({ handlers, intent }) => {
      handlers.setTool(intent.tool)
    },
  })

type CanvasKeyboardToolIntentKind = Extract<
  keyof typeof CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH.runners,
  CanvasKeyboardShortcutIntent['kind']
>

export type CanvasKeyboardToolIntent = Extract<
  CanvasKeyboardShortcutIntent,
  { kind: CanvasKeyboardToolIntentKind }
>

export function isCanvasKeyboardToolIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardToolIntent {
  return CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH.hasKind(intent.kind)
}

export function runCanvasKeyboardToolIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardToolHandlers
  intent: CanvasKeyboardToolIntent
}) {
  CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH.run({ handlers, intent })
}

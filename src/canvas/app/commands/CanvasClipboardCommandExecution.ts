import {
  createCanvasClipboardCommandEffectPlan,
  type CanvasClipboardCommand,
  type CanvasClipboardCommandEffectPlanContext,
} from './CanvasClipboardCommandEffectPlan'
import {
  EMPTY_CLIPBOARD_COMMAND_RESULT,
  applyCanvasClipboardCommandEffect,
  type CanvasClipboardCommandEffectContext,
  type CanvasClipboardCommandExecutionResult,
} from './CanvasClipboardCommandEffects'

export type {
  CanvasClipboardEditingUpdate,
  CanvasClipboardCommandExecutionResult,
} from './CanvasClipboardCommandEffects'
export type { CanvasClipboardCommand } from './CanvasClipboardCommandEffectPlan'

export type CanvasClipboardCommandExecutionContext =
  CanvasClipboardCommandEffectPlanContext &
  CanvasClipboardCommandEffectContext

export function executeCanvasClipboardCommand({
  command,
  context,
}: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandExecutionContext
}): CanvasClipboardCommandExecutionResult {
  const effect = createCanvasClipboardCommandEffectPlan({
    command,
    context,
  })

  return effect
    ? applyCanvasClipboardCommandEffect({ context, effect })
    : EMPTY_CLIPBOARD_COMMAND_RESULT
}

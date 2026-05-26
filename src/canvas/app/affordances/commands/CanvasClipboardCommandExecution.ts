import {
  createCanvasClipboardCommandEffectPlan,
  type CanvasClipboardCommandEffectPlanContext,
} from './CanvasClipboardCommandEffectPlan'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'
import type {
  CanvasClipboardCommandEffectContext,
  CanvasClipboardCommandExecutionResult,
} from './CanvasClipboardCommandEffectContracts'
import {
  EMPTY_CLIPBOARD_COMMAND_RESULT,
  applyCanvasClipboardCommandEffect,
} from './CanvasClipboardCommandEffects'

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

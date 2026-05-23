import {
  createCanvasClipboardCommandEffectPlan,
  type CanvasClipboardCommandEffectPlanContext,
} from './CanvasClipboardCommandEffectPlan'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'
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
export type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'

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

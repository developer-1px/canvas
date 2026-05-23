import {
  applyCanvasStandardDocumentEffect,
  type CanvasStandardCommandDocumentEffectContext,
} from './CanvasStandardCommandDocumentEffects'
import {
  createCanvasStandardCommandEffectPlan,
  type CanvasStandardCommand,
  type CanvasStandardCommandEffectPlanContext,
} from './CanvasStandardCommandEffectPlan'

export type { CanvasEditingUpdate } from './CanvasStandardCommandDocumentEffects'
export type { CanvasStandardCommand } from './CanvasStandardCommandEffectPlan'

export type CanvasStandardCommandExecutionContext =
  CanvasStandardCommandDocumentEffectContext &
  CanvasStandardCommandEffectPlanContext

export function executeCanvasStandardCommand({
  command,
  context,
}: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandExecutionContext
}) {
  const effect = createCanvasStandardCommandEffectPlan({
    command,
    context,
  })

  if (!effect) {
    return false
  }

  return applyCanvasStandardDocumentEffect({
    context,
    effect,
  })
}

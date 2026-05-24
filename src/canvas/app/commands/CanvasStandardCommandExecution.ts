import {
  applyCanvasStandardDocumentEffect,
} from './CanvasStandardCommandDocumentEffects'
import type {
  CanvasStandardCommandDocumentEffectContext,
} from './CanvasStandardCommandDocumentEffectContracts'
import {
  createCanvasStandardCommandEffectPlan,
  type CanvasStandardCommandEffectPlanContext,
} from './CanvasStandardCommandEffectPlan'
import type { CanvasStandardCommand } from './CanvasStandardCommandContracts'

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

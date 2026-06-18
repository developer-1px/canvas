import type { CanvasCommandItem } from '../../../engine'
import type { CanvasItem } from '../../../entities'
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

export type CanvasStandardCommandExecutionContext<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  CanvasStandardCommandDocumentEffectContext<TItem> &
  CanvasStandardCommandEffectPlanContext<TItem>

export function executeCanvasStandardCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  command,
  context,
}: {
  command: CanvasStandardCommand
  context: CanvasStandardCommandExecutionContext<TItem>
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

import {
  createCanvasClipboardCommandEffectPlan,
  type CanvasClipboardCommandEffectPlanContext,
} from './CanvasClipboardCommandEffectPlan'
import type {
  CanvasCommandItem,
} from '../../../engine'
import type { CanvasItem } from '../../../entities'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'
import type {
  CanvasClipboardCommandEffectContext,
  CanvasClipboardCommandExecutionResult,
} from './CanvasClipboardCommandEffectContracts'
import {
  applyCanvasClipboardCommandEffect,
} from './CanvasClipboardCommandEffects'

export type CanvasClipboardCommandExecutionContext<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  CanvasClipboardCommandEffectPlanContext<TItem> &
  CanvasClipboardCommandEffectContext<TItem>

export function executeCanvasClipboardCommand<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  command,
  context,
}: {
  command: CanvasClipboardCommand
  context: CanvasClipboardCommandExecutionContext<TItem>
}): CanvasClipboardCommandExecutionResult<TItem> {
  const effect = createCanvasClipboardCommandEffectPlan({
    command,
    context,
  })

  return effect
    ? applyCanvasClipboardCommandEffect({ context, effect })
    : {
        clonedItems: [],
        executed: false,
      }
}

import type {
  DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import type {
  DomEditLayoutContext,
} from '../../../shared/model/DomEditTypes'

export function shouldRenderDomEditSizeModeCapsule({
  affordanceState,
  context,
  isDragging,
}: {
  affordanceState: DomEditAffordanceState
  context: DomEditLayoutContext
  isDragging: boolean
}) {
  return (
    context.showSelfLayout ||
    context.showGridLayout ||
    context.showParentParticipation
  ) &&
    affordanceState.mode !== 'measure' &&
    affordanceState.mode !== 'xray' &&
    !isDragging
}

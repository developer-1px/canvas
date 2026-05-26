import type {
  CanvasArrowEndpoint,
  CanvasItem,
  Point,
} from '../../../../entities'
import {
  isCanvasArrowDrawingItem,
} from '../../../../host'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'

export type CanvasArrowEndpointPointerInteractionStartResult =
  | { capturePointer: false; kind: 'none' }
  | {
      capturePointer: true
      gesture: 'arrow-endpoint'
      interaction: Extract<Interaction, { kind: 'arrow-endpoint' }>
      kind: 'arrow-endpoint'
    }

export function startCanvasArrowEndpointPointerInteraction({
  arrowId,
  config,
  endpoint,
  input,
  items,
  startScreen,
  startWorld,
}: {
  arrowId: string
  config: CanvasAffordanceConfig
  endpoint: CanvasArrowEndpoint
  input: CanvasAppPointerInput
  items: CanvasItem[]
  startScreen: Point
  startWorld: Point
}): CanvasArrowEndpointPointerInteractionStartResult {
  const arrow = items.find((item) => item.id === arrowId)

  if (
    input.button !== 0 ||
    !config.gestures.resize ||
    !arrow ||
    !isCanvasArrowDrawingItem(arrow) ||
    arrow.locked === true
  ) {
    return { capturePointer: false, kind: 'none' }
  }

  return {
    capturePointer: true,
    gesture: 'arrow-endpoint',
    interaction: {
      arrowId,
      currentItems: items,
      currentWorld: startWorld,
      endpoint,
      historyItems: items,
      kind: 'arrow-endpoint',
      moved: false,
      pointerId: input.pointerId,
      startItems: items,
      startScreen,
      startWorld,
    },
    kind: 'arrow-endpoint',
  }
}

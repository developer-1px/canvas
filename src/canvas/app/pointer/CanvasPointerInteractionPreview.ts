import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasSceneAdapter,
  type CanvasTransformAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { previewCanvasPointerCreation } from './CanvasPointerCreationPreview'
import type {
  CanvasPointerInteractionPreviewResult,
} from './CanvasPointerInteractionResultContracts'
import { previewCanvasPointerMarqueeInteraction } from './CanvasPointerMarqueeInteraction'
import { previewCanvasPointerPanInteraction } from './CanvasPointerPanInteraction'
import { routeCanvasPointerInteraction } from './CanvasPointerInteractionRouting'
import { previewCanvasPointerTransform } from './CanvasPointerTransformPreview'

export type CanvasPointerInteractionPreviewInput = {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  input: CanvasAppPointerInput
  interaction: Interaction
  scene: CanvasSceneAdapter
  transformAdapter: CanvasTransformAdapter<CanvasItem>
  viewport: Viewport
}

export function previewCanvasPointerInteraction({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
  scene,
  transformAdapter,
  viewport,
}: CanvasPointerInteractionPreviewInput): CanvasPointerInteractionPreviewResult {
  return routeCanvasPointerInteraction<CanvasPointerInteractionPreviewResult>(
    interaction,
    {
      creation: (interaction) =>
        previewCanvasPointerCreation({
          config,
          currentScreen,
          currentWorld,
          input,
          interaction,
          scene,
        }),
      fallback: () => ({ kind: 'none' }),
      marquee: (interaction) =>
        previewCanvasPointerMarqueeInteraction({
          config,
          currentScreen,
          currentWorld,
          interaction,
          scene,
        }),
      pan: (interaction) =>
        previewCanvasPointerPanInteraction({
          config,
          currentScreen,
          interaction,
        }),
      transform: (interaction) =>
        previewCanvasPointerTransform({
          config,
          currentScreen,
          currentWorld,
          input,
          interaction,
          scene,
          transformAdapter,
          viewport,
        }),
    },
  )
}

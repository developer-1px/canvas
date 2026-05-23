import type {
  Bounds,
  CanvasItem,
  Point,
  Viewport,
} from '../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import {
  isCanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import { previewCanvasPointerCreation } from './CanvasPointerCreationPreview'
import { previewCanvasPointerMarqueeInteraction } from './CanvasPointerMarqueeInteraction'
import { previewCanvasPointerPanInteraction } from './CanvasPointerPanInteraction'
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

export type CanvasPointerInteractionPreviewResult =
  | { kind: 'none' }
  | {
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      interaction?: Interaction
      kind: 'preview'
      liveItems?: CanvasItem[]
      marquee?: Bounds
      selection?: string[]
      snapGuides?: CanvasSnapGuides
      viewport?: Viewport
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
  if (interaction.kind === 'pan') {
    return previewCanvasPointerPanInteraction({
      config,
      currentScreen,
      interaction,
    })
  }

  if (interaction.kind === 'move') {
    return previewCanvasPointerTransform({
      config,
      currentScreen,
      currentWorld,
      input,
      interaction,
      scene,
      transformAdapter,
      viewport,
    })
  }

  if (interaction.kind === 'resize') {
    return previewCanvasPointerTransform({
      config,
      currentScreen,
      currentWorld,
      input,
      interaction,
      scene,
      transformAdapter,
      viewport,
    })
  }

  if (interaction.kind === 'marquee') {
    return previewCanvasPointerMarqueeInteraction({
      config,
      currentScreen,
      currentWorld,
      interaction,
      scene,
    })
  }

  if (isCanvasPointerCreationInteraction(interaction)) {
    return previewCanvasPointerCreation({
      config,
      currentScreen,
      currentWorld,
      input,
      interaction,
    })
  }

  return { kind: 'none' }
}

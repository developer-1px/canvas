import type {
  Bounds,
  CanvasItem,
  Point,
  Viewport,
} from '../../entities'
import {
  normalizeBounds,
} from '../../core'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  getCanvasMarqueeSelection,
  type CanvasAffordanceConfig,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { previewCanvasPointerCreation } from './CanvasPointerCreationPreview'
import { previewCanvasPointerTransform } from './CanvasPointerTransformPreview'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

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
    if (!config.gestures.pan) {
      return { kind: 'none' }
    }

    const dx = currentScreen.x - interaction.startScreen.x
    const dy = currentScreen.y - interaction.startScreen.y

    return {
      kind: 'preview',
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
      viewport: {
        ...interaction.origin,
        x: interaction.origin.x + dx,
        y: interaction.origin.y + dy,
      },
    }
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
    if (!config.gestures.marquee) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })
    const bounds = normalizeBounds(interaction.startWorld, currentWorld)
    const nextInteraction = {
      ...interaction,
      currentWorld,
      moved,
    }

    if (!moved) {
      return {
        interaction: nextInteraction,
        kind: 'preview',
        snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
      }
    }

    return {
      interaction: nextInteraction,
      kind: 'preview',
      marquee: bounds,
      selection: getCanvasMarqueeSelection({
        additive: interaction.additive,
        baseSelection: interaction.baseSelection,
        bounds,
        scene,
      }),
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
  }

  if (interaction.kind === 'create-rect') {
    return previewCanvasPointerCreation({
      config,
      currentScreen,
      currentWorld,
      input,
      interaction,
    })
  }

  if (
    interaction.kind === 'draw-marker' ||
    interaction.kind === 'draw-highlight'
  ) {
    return previewCanvasPointerCreation({
      config,
      currentScreen,
      currentWorld,
      input,
      interaction,
    })
  }

  if (interaction.kind === 'create-arrow') {
    return previewCanvasPointerCreation({
      config,
      currentScreen,
      currentWorld,
      input,
      interaction,
    })
  }

  if (interaction.kind === 'create-custom') {
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

import type {
  Bounds,
  Point,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasSnapGuides,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import {
  previewCanvasPointerDrawingCreation,
} from './CanvasPointerDrawingCreation'
import {
  previewCanvasPointerShapeCreation,
} from './CanvasPointerShapeCreation'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

type CanvasPointerCreationPreviewInput = {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  input: CanvasAppPointerInput
  interaction: CanvasPointerCreationInteraction
}

export type CanvasPointerCreationPreviewResult =
  | { kind: 'none' }
  | {
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      interaction?: Interaction
      kind: 'preview'
      snapGuides?: CanvasSnapGuides
    }

export function previewCanvasPointerCreation({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
}: CanvasPointerCreationPreviewInput): CanvasPointerCreationPreviewResult {
  const shapePreview = previewCanvasPointerShapeCreation({
    config,
    currentScreen,
    currentWorld,
    interaction,
  })

  if (shapePreview) {
    return shapePreview
  }

  const drawingPreview = previewCanvasPointerDrawingCreation({
    config,
    currentScreen,
    currentWorld,
    input,
    interaction,
  })

  if (drawingPreview) {
    return drawingPreview
  }

  if (interaction.kind === 'create-custom') {
    if (!config.gestures.createCustom) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })
    const snappedCurrentWorld = snapCanvasPointToGrid({
      config,
      point: currentWorld,
    })

    return {
      interaction: {
        ...interaction,
        currentWorld: snappedCurrentWorld,
        moved,
      },
      kind: 'preview',
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
  }

  return { kind: 'none' }
}

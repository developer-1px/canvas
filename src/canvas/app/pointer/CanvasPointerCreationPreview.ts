import type {
  Bounds,
  Point,
} from '../../entities'
import { normalizeBounds } from '../../core'
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
  createCanvasDraftStroke,
  getNextCanvasDrawingPoints,
} from './CanvasPointerDrawing'
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
  if (interaction.kind === 'create-rect') {
    if (!config.gestures.createRect) {
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
      draftRect: normalizeBounds(interaction.startWorld, snappedCurrentWorld),
      interaction: {
        ...interaction,
        currentWorld: snappedCurrentWorld,
        moved,
      },
      kind: 'preview',
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
  }

  if (
    interaction.kind === 'draw-marker' ||
    interaction.kind === 'draw-highlight'
  ) {
    const drawingKind =
      interaction.kind === 'draw-marker' ? 'marker' : 'highlight'
    const enabled =
      drawingKind === 'marker'
        ? config.gestures.drawMarker
        : config.gestures.drawHighlight

    if (!enabled) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })
    const points = getNextCanvasDrawingPoints({
      currentWorld,
      points: interaction.points,
      shiftKey: input.shiftKey,
      startWorld: interaction.startWorld,
    })

    return {
      draftStroke: createCanvasDraftStroke(drawingKind, points),
      interaction: {
        ...interaction,
        currentWorld,
        points,
        moved,
      },
      kind: 'preview',
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
  }

  if (interaction.kind === 'create-arrow') {
    if (!config.gestures.createArrow) {
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
      draftArrow: {
        end: snappedCurrentWorld,
        start: interaction.startWorld,
      },
      interaction: {
        ...interaction,
        currentWorld: snappedCurrentWorld,
        moved,
      },
      kind: 'preview',
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
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

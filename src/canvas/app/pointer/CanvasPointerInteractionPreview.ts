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
  getCanvasMoveSnap,
  moveCanvasSelection,
  resizeCanvasSelection,
  snapCanvasPointToGrid,
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
    if (!config.gestures.move) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })

    if (!moved) {
      return { kind: 'none' }
    }

    const dx = currentWorld.x - interaction.startWorld.x
    const dy = currentWorld.y - interaction.startWorld.y
    const snap = interaction.bounds
      ? getCanvasMoveSnap({
          bounds: interaction.bounds,
          config,
          dx,
          dy,
          scene,
          selection: interaction.ids,
          viewport,
        })
      : {
          ...EMPTY_CANVAS_SNAP_GUIDES,
          dx,
          dy,
        }
    const nextItems = moveCanvasSelection({
      adapter: transformAdapter,
      dx: snap.dx,
      dy: snap.dy,
      items: interaction.startItems,
      selection: interaction.ids,
    })

    return {
      interaction: {
        ...interaction,
        currentItems: nextItems,
        moved: true,
      },
      kind: 'preview',
      liveItems: nextItems,
      snapGuides: {
        alignmentGuides: snap.alignmentGuides,
        spacingGuides: snap.spacingGuides,
      },
    }
  }

  if (interaction.kind === 'resize') {
    if (!config.gestures.resize) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })

    if (!moved) {
      return { kind: 'none' }
    }

    const snappedCurrentWorld = snapCanvasPointToGrid({
      config,
      point: currentWorld,
    })
    const nextItems = resizeCanvasSelection({
      adapter: transformAdapter,
      bounds: interaction.bounds,
      handle: interaction.handle,
      items: interaction.startItems,
      point: snappedCurrentWorld,
      preserveAspectRatio: input.shiftKey,
      resizeFromCenter: input.altKey,
      selection: interaction.ids,
    })

    return {
      interaction: {
        ...interaction,
        currentItems: nextItems,
        moved: true,
      },
      kind: 'preview',
      liveItems: nextItems,
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
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

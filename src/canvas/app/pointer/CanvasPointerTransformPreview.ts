import type {
  CanvasItem,
  Point,
  Viewport,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  getCanvasMoveSnap,
  moveCanvasSelection,
  resizeCanvasSelection,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

type CanvasPointerTransformInteraction = Extract<
  Interaction,
  { kind: 'move' } | { kind: 'resize' }
>

type CanvasPointerTransformPreviewInput = {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  input: CanvasAppPointerInput
  interaction: CanvasPointerTransformInteraction
  scene: CanvasSceneAdapter
  transformAdapter: CanvasTransformAdapter<CanvasItem>
  viewport: Viewport
}

export type CanvasPointerTransformPreviewResult =
  | { kind: 'none' }
  | {
      interaction: CanvasPointerTransformInteraction
      kind: 'preview'
      liveItems: CanvasItem[]
      snapGuides: CanvasSnapGuides
    }

export function previewCanvasPointerTransform({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
  scene,
  transformAdapter,
  viewport,
}: CanvasPointerTransformPreviewInput): CanvasPointerTransformPreviewResult {
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

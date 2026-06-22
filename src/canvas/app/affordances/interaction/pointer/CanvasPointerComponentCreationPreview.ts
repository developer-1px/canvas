import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAffordanceConfig,
  snapCanvasPointToGrid,
} from '../../../../engine'
import type { Point } from '../../../../entities'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'
import type { Interaction } from './CanvasInteractionState'
import {
  getCanvasComponentCreationBounds,
  getCanvasComponentCreationDefaultSize,
} from './CanvasPointerComponentCreationGeometry'
import {
  isCanvasPointerComponentCreationInteraction,
} from './CanvasPointerComponentCreationStart'
import {
  getCanvasPointerComponentCreationDescriptor,
} from './CanvasPointerComponentCreationDescriptors'
import type {
  CanvasPointerComponentCreationPreviewResult,
} from './CanvasPointerComponentCreationContracts'

export function previewCanvasPointerComponentCreation({
  config,
  currentScreen,
  currentWorld,
  interaction,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: Interaction
}): CanvasPointerComponentCreationPreviewResult | null {
  if (!isCanvasPointerComponentCreationInteraction(interaction)) {
    return null
  }

  const descriptor = getCanvasPointerComponentCreationDescriptor(
    interaction.kind,
  )

  if (!descriptor.isEnabled(config)) {
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
  const nextInteraction = {
    ...interaction,
    currentWorld: snappedCurrentWorld,
    moved,
  }

  return {
    draftRect: getCanvasComponentCreationBounds({
      currentWorld: nextInteraction.currentWorld,
      defaultSize: getCanvasComponentCreationDefaultSize({ descriptor }),
      moved: nextInteraction.moved,
      startWorld: nextInteraction.startWorld,
    }),
    interaction: nextInteraction,
    kind: 'preview',
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

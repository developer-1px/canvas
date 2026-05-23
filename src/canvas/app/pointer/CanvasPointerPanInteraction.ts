import type {
  Point,
  Viewport,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAffordanceConfig,
  type CanvasSnapGuides,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'

export type CanvasPointerPanInteraction = Extract<
  Interaction,
  { kind: 'pan' }
>

export type CanvasPointerPanStartResult = {
  capturePointer: true
  gesture: 'pan'
  interaction: CanvasPointerPanInteraction
}

export type CanvasPointerPanPreviewResult =
  | { kind: 'none' }
  | {
      kind: 'preview'
      snapGuides: CanvasSnapGuides
      viewport: Viewport
    }

export function startCanvasPointerPanInteraction({
  input,
  startScreen,
  viewport,
}: {
  input: CanvasAppPointerInput
  startScreen: Point
  viewport: Viewport
}): CanvasPointerPanStartResult {
  return {
    capturePointer: true,
    gesture: 'pan',
    interaction: {
      kind: 'pan',
      origin: viewport,
      pointerId: input.pointerId,
      startScreen,
    },
  }
}

export function previewCanvasPointerPanInteraction({
  config,
  currentScreen,
  interaction,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  interaction: CanvasPointerPanInteraction
}): CanvasPointerPanPreviewResult {
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

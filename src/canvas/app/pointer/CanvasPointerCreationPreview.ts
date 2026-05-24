import type {
  Point,
} from '../../entities'
import {
  type CanvasAffordanceConfig,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import type {
  CanvasPointerCreationPreviewResult,
} from './CanvasPointerInteractionResultContracts'
import {
  previewCanvasPointerDrawingCreation,
} from './CanvasPointerDrawingCreation'
import {
  previewCanvasPointerCustomCreation,
} from './CanvasPointerCustomCreation'
import {
  previewCanvasPointerShapeCreation,
} from './CanvasPointerShapeCreation'

type CanvasPointerCreationPreviewInput = {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  input: CanvasAppPointerInput
  interaction: CanvasPointerCreationInteraction
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

  const customPreview = previewCanvasPointerCustomCreation({
    config,
    currentScreen,
    currentWorld,
    interaction,
  })

  if (customPreview) {
    return customPreview
  }

  return { kind: 'none' }
}

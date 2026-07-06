import type {
  Point,
} from '../../../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasSceneAdapter,
} from '../../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import type {
  CanvasPointerCreationPreviewResult,
} from './CanvasPointerInteractionResultContracts'
import {
  previewCanvasPointerComponentCreation,
} from './CanvasPointerComponentCreation'
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
  scene: CanvasSceneAdapter
}

export function previewCanvasPointerCreation({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
  scene,
}: CanvasPointerCreationPreviewInput): CanvasPointerCreationPreviewResult {
  const shapePreview = previewCanvasPointerShapeCreation({
    config,
    currentScreen,
    currentWorld,
    input,
    interaction,
    scene,
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

  const componentPreview = previewCanvasPointerComponentCreation({
    config,
    currentScreen,
    currentWorld,
    interaction,
  })

  if (componentPreview) {
    return componentPreview
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

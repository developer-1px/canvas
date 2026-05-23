import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
} from '../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasPointerGesture,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import {
  isCanvasPointerCreationGesture,
} from './CanvasPointerCreationGrammar'
import {
  startCanvasPointerDrawingCreation,
} from './CanvasPointerDrawingCreation'
import {
  startCanvasPointerCustomCreation,
} from './CanvasPointerCustomCreation'
import {
  startCanvasPointerShapeCreation,
} from './CanvasPointerShapeCreation'
import {
  startCanvasPointerTextCreation,
} from './CanvasPointerTextCreation'

export type CanvasPointerCreationStartResult =
  | { kind: 'none' }
  | {
      kind: 'interaction'
      capturePointer: true
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      gesture: Interaction['kind']
      interaction: Interaction
    }
  | {
      kind: 'created-text'
      capturePointer: false
      edit: EditingText
      item: CanvasItem
    }

export type CanvasPointerCreationStartInput = {
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
  tool: Tool
}

export function startCanvasPointerCreation({
  config,
  creationAdapter,
  createId,
  customCreationTools,
  input,
  pointerGesture,
  startScreen,
  startWorld,
  tool,
}: CanvasPointerCreationStartInput): CanvasPointerCreationStartResult | null {
  if (!isCanvasPointerCreationGesture(pointerGesture)) {
    return null
  }

  const shapeStart = startCanvasPointerShapeCreation({
    config,
    input,
    pointerGesture,
    startScreen,
    startWorld,
  })

  if (shapeStart) {
    return shapeStart
  }

  const drawingStart = startCanvasPointerDrawingCreation({
    input,
    pointerGesture,
    startScreen,
    startWorld,
  })

  if (drawingStart) {
    return drawingStart
  }

  const customStart = startCanvasPointerCustomCreation({
    config,
    customCreationTools,
    input,
    pointerGesture,
    startScreen,
    startWorld,
    tool,
  })

  if (customStart) {
    return customStart
  }

  const textStart = startCanvasPointerTextCreation({
    config,
    creationAdapter,
    createId,
    pointerGesture,
    startWorld,
  })

  if (textStart) {
    return textStart
  }

  return { kind: 'none' }
}

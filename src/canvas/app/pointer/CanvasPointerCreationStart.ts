import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
} from '../../entities'
import {
  isCanvasCustomToolId,
} from '../../core'
import {
  createCanvasText,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
  type CanvasPointerGesture,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import { getCanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationToolRuntime'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import {
  isCanvasPointerCreationGesture,
} from './CanvasPointerCreationGrammar'
import {
  startCanvasPointerDrawingCreation,
} from './CanvasPointerDrawingCreation'
import {
  startCanvasPointerShapeCreation,
} from './CanvasPointerShapeCreation'

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

  if (pointerGesture === 'create-custom' && isCanvasCustomToolId(tool)) {
    if (!getCanvasAppCustomCreationTool(customCreationTools, tool)) {
      return { kind: 'none' }
    }

    const snappedStartWorld = snapCanvasPointToGrid({
      config,
      point: startWorld,
    })

    return {
      kind: 'interaction',
      capturePointer: true,
      gesture: 'create-custom',
      interaction: {
        kind: 'create-custom',
        pointerId: input.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        tool,
        moved: false,
      },
    }
  }

  if (pointerGesture === 'create-text') {
    if (!config.gestures.createText) {
      return { kind: 'none' }
    }

    const created = createCanvasText({
      adapter: creationAdapter,
      createId,
      point: startWorld,
    })

    return {
      kind: 'created-text',
      capturePointer: false,
      edit: { id: created.item.id, value: created.editValue },
      item: created.item,
    }
  }

  return { kind: 'none' }
}

import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import {
  getCanvasPointerGesture,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { startCanvasPointerCreation } from './CanvasPointerCreationStart'
import { startCanvasPointerMarqueeInteraction } from './CanvasPointerMarqueeInteraction'
import { startCanvasPointerPanInteraction } from './CanvasPointerPanInteraction'

export type CanvasPointerInteractionStartResult =
  | { kind: 'none' }
  | {
      kind: 'interaction'
      capturePointer: true
      clearSelection?: boolean
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

export type CanvasPointerInteractionStartInput = {
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  input: CanvasAppPointerInput
  selection: string[]
  spaceDown: boolean
  startScreen: Point
  startWorld: Point
  tool: Tool
  viewport: Viewport
}

export function startCanvasPointerInteraction({
  config,
  creationAdapter,
  createId,
  customCreationTools,
  input,
  selection,
  spaceDown,
  startScreen,
  startWorld,
  tool,
  viewport,
}: CanvasPointerInteractionStartInput): CanvasPointerInteractionStartResult {
  const pointerGesture = getCanvasPointerGesture({
    config,
    input,
    spaceDown,
    tool,
  })

  if (pointerGesture === 'none') {
    return { kind: 'none' }
  }

  if (pointerGesture === 'pan') {
    return {
      ...startCanvasPointerPanInteraction({
        input,
        startScreen,
        viewport,
      }),
      kind: 'interaction',
    }
  }

  const creationStart = startCanvasPointerCreation({
    config,
    creationAdapter,
    createId,
    customCreationTools,
    input,
    pointerGesture,
    startScreen,
    startWorld,
    tool,
  })

  if (creationStart) {
    return creationStart
  }

  const marqueeStart = startCanvasPointerMarqueeInteraction({
    input,
    selection,
    startScreen,
    startWorld,
  })

  return {
    ...marqueeStart,
    kind: 'interaction',
  }
}

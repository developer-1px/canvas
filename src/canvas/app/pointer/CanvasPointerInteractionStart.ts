import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import { isAdditivePointerInput } from '../../engine'
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
      kind: 'interaction',
      capturePointer: true,
      gesture: 'pan',
      interaction: {
        kind: 'pan',
        pointerId: input.pointerId,
        startScreen,
        origin: viewport,
      },
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

  const additive = isAdditivePointerInput(input)

  return {
    kind: 'interaction',
    capturePointer: true,
    clearSelection: !additive,
    gesture: 'marquee',
    interaction: {
      kind: 'marquee',
      pointerId: input.pointerId,
      startScreen,
      startWorld,
      currentWorld: startWorld,
      additive,
      baseSelection: selection,
      moved: false,
    },
  }
}

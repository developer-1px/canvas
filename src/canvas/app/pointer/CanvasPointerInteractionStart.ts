import type {
  CanvasItem,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import {
  getCanvasPointerGesture,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
} from '../../engine'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasDrawingStrokeStyleSet } from '../../host'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { startCanvasPointerCreation } from './CanvasPointerCreationStart'
import type {
  CanvasPointerInteractionStartResult,
} from './CanvasPointerInteractionResultContracts'
import { startCanvasPointerMarqueeInteraction } from './CanvasPointerMarqueeInteraction'
import { startCanvasPointerPanInteraction } from './CanvasPointerPanInteraction'

export type CanvasPointerInteractionStartInput = {
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  drawingStyles: CanvasDrawingStrokeStyleSet
  input: CanvasAppPointerInput
  selection: string[]
  spaceDown: boolean
  startScreen: Point
  startWorld: Point
  targetItemId?: string
  tool: Tool
  viewport: Viewport
}

export function startCanvasPointerInteraction({
  componentLibrary,
  config,
  creationAdapter,
  createId,
  customCreationTools,
  drawingStyles,
  input,
  selection,
  spaceDown,
  startScreen,
  startWorld,
  targetItemId,
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
    componentLibrary,
    config,
    creationAdapter,
    createId,
    customCreationTools,
    drawingStyles,
    input,
    pointerGesture,
    startScreen,
    startWorld,
    targetItemId,
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

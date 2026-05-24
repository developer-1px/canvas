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
  type CanvasSceneAdapter,
} from '../../engine'
import type { CanvasAppComponentLibrary } from '../workflow/CanvasAppComponentAssemblyContracts'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasDrawingStrokeStyleSet } from '../../host'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { startCanvasPointerCreation } from './CanvasPointerCreationStart'
import { startCanvasPointerEraserInteraction } from './CanvasPointerEraser'
import { startCanvasPointerLaserInteraction } from './CanvasPointerLaser'
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
  itemReadModel: CanvasAppItemReadModel
  scene: CanvasSceneAdapter
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
  itemReadModel,
  scene,
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

  const eraserStart = startCanvasPointerEraserInteraction({
    config,
    input,
    itemReadModel,
    pointerGesture,
    scene,
    startScreen,
    startWorld,
    targetItemId,
  })

  if (eraserStart) {
    return eraserStart
  }

  const laserStart = startCanvasPointerLaserInteraction({
    config,
    input,
    pointerGesture,
    startScreen,
    startWorld,
  })

  if (laserStart) {
    return laserStart
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

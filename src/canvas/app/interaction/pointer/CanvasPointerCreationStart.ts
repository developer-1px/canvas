import type {
  CanvasItem,
  Point,
  Tool,
} from '../../../entities'
import {
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasPointerGesture,
} from '../../../engine'
import type { CanvasAppCustomCreationTool } from '../../tools/CanvasAppCustomCreationTools'
import type { CanvasDrawingStrokeStyleSet } from '../../../host'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  isCanvasPointerCreationGesture,
} from './CanvasPointerCreationGrammar'
import {
  startCanvasPointerCommentCreation,
} from './CanvasPointerCommentCreation'
import {
  startCanvasPointerComponentCreation,
} from './CanvasPointerComponentCreation'
import type {
  CanvasPointerCreationStartResult,
} from './CanvasPointerInteractionResultContracts'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
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

export type CanvasPointerCreationStartInput = {
  componentLibrary: CanvasAppComponentLibrary
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  drawingStyles: CanvasDrawingStrokeStyleSet
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
  targetItemId?: string
  tool: Tool
}

export function startCanvasPointerCreation({
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
    targetItemId,
    tool,
  })

  if (shapeStart) {
    return shapeStart
  }

  const drawingStart = startCanvasPointerDrawingCreation({
    drawingStyles,
    input,
    pointerGesture,
    startScreen,
    startWorld,
  })

  if (drawingStart) {
    return drawingStart
  }

  const commentStart = startCanvasPointerCommentCreation({
    config,
    createId,
    pointerGesture,
    startWorld,
    targetItemId,
  })

  if (commentStart) {
    return commentStart
  }

  const componentStart = startCanvasPointerComponentCreation({
    componentLibrary,
    config,
    createId,
    input,
    pointerGesture,
    startScreen,
    startWorld,
  })

  if (componentStart) {
    return componentStart
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

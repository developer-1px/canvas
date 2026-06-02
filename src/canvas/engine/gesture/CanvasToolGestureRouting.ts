import {
  isCanvasBuiltinShapeTool,
  isCanvasCustomToolId,
  type CanvasBuiltinShapeTool,
  type CanvasBuiltinTool,
  type Tool,
} from '../../core'
import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'

export type CanvasPointerInput = {
  altKey: boolean
  button: number
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export type CanvasPointerGesture =
  | 'create-arrow'
  | 'create-comment'
  | 'create-custom'
  | 'create-shape'
  | 'create-section'
  | 'create-sticky'
  | 'create-text'
  | 'draw-highlight'
  | 'draw-marker'
  | 'draw-path'
  | 'erase'
  | 'laser'
  | 'marquee'
  | 'none'
  | 'pan'

type CanvasToolPointerGesture = Exclude<CanvasPointerGesture, 'marquee' | 'none'>

type CanvasToolGestureRoute = Readonly<{
  gesture?: CanvasToolPointerGesture
  isEnabled?: (config: CanvasAffordanceConfig) => boolean
  routeItemPointerToCanvasGesture: boolean
}>

type CanvasToolGestureRouteInput = Readonly<{
  gesture?: CanvasToolPointerGesture
  isEnabled?: (config: CanvasAffordanceConfig) => boolean
  routeItemPointerToCanvasGesture?: boolean
}>

type CanvasNonShapeBuiltinTool = Exclude<
  CanvasBuiltinTool,
  CanvasBuiltinShapeTool
>

const CANVAS_SHAPE_TOOL_GESTURE_ROUTE = createCanvasToolGestureRoute({
  gesture: 'create-shape',
  isEnabled: (config) => config.gestures.createShape,
})

export const CANVAS_TOOL_GESTURE_ROUTES = Object.freeze({
  arrow: createCanvasToolGestureRoute({
    gesture: 'create-arrow',
    isEnabled: (config) => config.gestures.createArrow,
  }),
  comment: createCanvasToolGestureRoute({
    gesture: 'create-comment',
    isEnabled: (config) => config.gestures.createComment,
  }),
  highlight: createCanvasToolGestureRoute({
    gesture: 'draw-highlight',
    isEnabled: (config) => config.gestures.drawHighlight,
  }),
  marker: createCanvasToolGestureRoute({
    gesture: 'draw-marker',
    isEnabled: (config) => config.gestures.drawMarker,
  }),
  pen: createCanvasToolGestureRoute({
    gesture: 'draw-path',
    isEnabled: (config) => config.gestures.drawPath,
  }),
  eraser: createCanvasToolGestureRoute({
    gesture: 'erase',
    isEnabled: (config) => config.gestures.eraseDrawing,
  }),
  laser: createCanvasToolGestureRoute({
    gesture: 'laser',
    isEnabled: (config) => config.gestures.laserPointer,
  }),
  pan: createCanvasToolGestureRoute({
    gesture: 'pan',
    isEnabled: (config) => config.gestures.pan,
  }),
  select: createCanvasToolGestureRoute({
    routeItemPointerToCanvasGesture: false,
  }),
  section: createCanvasToolGestureRoute({
    gesture: 'create-section',
    isEnabled: (config) => config.gestures.createSection,
  }),
  sticky: createCanvasToolGestureRoute({
    gesture: 'create-sticky',
    isEnabled: (config) => config.gestures.createSticky,
  }),
  text: createCanvasToolGestureRoute({
    gesture: 'create-text',
    isEnabled: (config) => config.gestures.createText,
  }),
} satisfies Readonly<Record<CanvasNonShapeBuiltinTool, CanvasToolGestureRoute>>)

export function shouldStartCanvasPanGesture({
  config,
  input,
  spaceDown,
  tool,
}: {
  config: CanvasAffordanceConfig
  input: CanvasPointerInput
  spaceDown: boolean
  tool: Tool
}) {
  return (
    config.gestures.pan &&
    (input.button === 1 || spaceDown || getCanvasToolGesture(tool) === 'pan')
  )
}

export function getCanvasToolPointerGesture({
  config,
  tool,
}: {
  config: CanvasAffordanceConfig
  tool: Tool
}): CanvasPointerGesture | null {
  if (isCanvasCustomToolId(tool)) {
    return config.gestures.createCustom ? 'create-custom' : null
  }

  const route = getCanvasBuiltinToolGestureRoute(tool)

  if (!route.gesture || !route.isEnabled?.(config)) {
    return null
  }

  return route.gesture
}

export function shouldRouteCanvasToolPointerToCanvasGesture({
  spaceDown,
  tool,
}: {
  spaceDown: boolean
  tool: Tool
}) {
  if (spaceDown || isCanvasCustomToolId(tool)) {
    return true
  }

  return getCanvasBuiltinToolGestureRoute(tool).routeItemPointerToCanvasGesture
}

function createCanvasToolGestureRoute(
  route: CanvasToolGestureRouteInput,
): CanvasToolGestureRoute {
  return Object.freeze({
    routeItemPointerToCanvasGesture:
      route.routeItemPointerToCanvasGesture ?? true,
    ...route,
  })
}

function getCanvasToolGesture(tool: Tool) {
  if (isCanvasCustomToolId(tool)) {
    return null
  }

  return getCanvasBuiltinToolGestureRoute(tool).gesture ?? null
}

function getCanvasBuiltinToolGestureRoute(
  tool: CanvasBuiltinTool,
): CanvasToolGestureRoute {
  return isCanvasBuiltinShapeTool(tool)
    ? CANVAS_SHAPE_TOOL_GESTURE_ROUTE
    : CANVAS_TOOL_GESTURE_ROUTES[tool]
}

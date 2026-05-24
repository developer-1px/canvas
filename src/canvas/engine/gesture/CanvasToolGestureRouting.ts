import {
  isCanvasCustomToolId,
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
  | 'create-rect'
  | 'create-sticky'
  | 'create-text'
  | 'draw-highlight'
  | 'draw-marker'
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
  pan: createCanvasToolGestureRoute({
    gesture: 'pan',
    isEnabled: (config) => config.gestures.pan,
  }),
  rect: createCanvasToolGestureRoute({
    gesture: 'create-rect',
    isEnabled: (config) => config.gestures.createRect,
  }),
  select: createCanvasToolGestureRoute({
    routeItemPointerToCanvasGesture: false,
  }),
  sticky: createCanvasToolGestureRoute({
    gesture: 'create-sticky',
    isEnabled: (config) => config.gestures.createSticky,
  }),
  text: createCanvasToolGestureRoute({
    gesture: 'create-text',
    isEnabled: (config) => config.gestures.createText,
  }),
} satisfies Readonly<Record<CanvasBuiltinTool, CanvasToolGestureRoute>>)

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

  const route = CANVAS_TOOL_GESTURE_ROUTES[tool]

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

  return CANVAS_TOOL_GESTURE_ROUTES[tool].routeItemPointerToCanvasGesture
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

  return CANVAS_TOOL_GESTURE_ROUTES[tool].gesture ?? null
}

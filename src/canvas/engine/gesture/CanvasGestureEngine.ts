import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type { Tool } from '../../core'
import {
  getCanvasToolPointerGesture,
  shouldRouteCanvasToolPointerToCanvasGesture,
  shouldStartCanvasPanGesture,
  type CanvasPointerGesture,
  type CanvasPointerInput,
} from './CanvasToolGestureRouting'

export type {
  CanvasPointerGesture,
  CanvasPointerInput,
} from './CanvasToolGestureRouting'

export type CanvasItemPointerIntent = {
  additive: boolean
  altDragDuplicate: boolean
  textEdit: boolean
}

export function getCanvasPointerGesture({
  config,
  input,
  spaceDown,
  tool,
}: {
  config: CanvasAffordanceConfig
  input: CanvasPointerInput
  spaceDown: boolean
  tool: Tool
}): CanvasPointerGesture {
  if (input.button !== 0 && input.button !== 1) {
    return 'none'
  }

  if (shouldStartCanvasPanGesture({ config, input, spaceDown, tool })) {
    return 'pan'
  }

  const toolGesture = getCanvasToolPointerGesture({ config, tool })

  if (toolGesture) {
    return toolGesture
  }

  return config.gestures.marquee ? 'marquee' : 'none'
}

export function shouldRouteCanvasItemPointerToCanvasGesture({
  spaceDown,
  tool,
}: {
  spaceDown: boolean
  tool: Tool
}) {
  return shouldRouteCanvasToolPointerToCanvasGesture({ spaceDown, tool })
}

export function getCanvasItemPointerIntent({
  config,
  input,
  isDoubleClick,
}: {
  config: CanvasAffordanceConfig
  input: CanvasPointerInput
  isDoubleClick: boolean
}): CanvasItemPointerIntent {
  const additive = isAdditivePointerInput(input)

  return {
    additive,
    altDragDuplicate:
      input.altKey &&
      config.gestures.altDragDuplicate &&
      config.commands.duplicate,
    textEdit: isDoubleClick && !additive && config.gestures.textEdit,
  }
}

export function isAdditivePointerInput(input: CanvasPointerInput) {
  return input.shiftKey || input.metaKey || input.ctrlKey
}

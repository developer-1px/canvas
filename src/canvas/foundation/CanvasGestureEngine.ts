import type { Tool } from '../core'
import {
  getCanvasToolPointerGesture,
  shouldRouteCanvasToolPointerToCanvasGesture,
  shouldStartCanvasPanGesture,
  type CanvasPointerGesture,
  type CanvasPointerInput,
  type CanvasToolGestureConfig,
} from './CanvasToolGestureRouting'

export type {
  CanvasPointerGesture,
  CanvasPointerInput,
} from './CanvasToolGestureRouting'

export type CanvasItemPointerIntent = {
  additive: boolean
  altDragDuplicate: boolean
  dragDuplicate: boolean
  textEdit: boolean
}

export type CanvasPointerGestureConfig = CanvasToolGestureConfig & Readonly<{
  commands: Readonly<{
    duplicate: boolean
  }>
  gestures: CanvasToolGestureConfig['gestures'] & Readonly<{
    altDragDuplicate: boolean
    marquee: boolean
    textEdit: boolean
  }>
}>

export function getCanvasPointerGesture({
  config,
  input,
  spaceDown,
  tool,
}: {
  config: CanvasPointerGestureConfig
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
  config: CanvasPointerGestureConfig
  input: CanvasPointerInput
  isDoubleClick: boolean
}): CanvasItemPointerIntent {
  const additive = isAdditivePointerInput(input)
  const dragDuplicate =
    (input.altKey || input.ctrlKey || input.metaKey) &&
    config.gestures.altDragDuplicate &&
    config.commands.duplicate

  return {
    additive,
    altDragDuplicate:
      input.altKey &&
      config.gestures.altDragDuplicate &&
      config.commands.duplicate,
    dragDuplicate,
    textEdit: isDoubleClick && !additive && config.gestures.textEdit,
  }
}

export function isAdditivePointerInput(input: CanvasPointerInput) {
  return input.shiftKey || input.metaKey || input.ctrlKey
}

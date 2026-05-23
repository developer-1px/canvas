import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type { Tool } from '../../core'

export type CanvasPointerInput = {
  altKey: boolean
  button: number
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export type CanvasPointerGesture =
  | 'create-arrow'
  | 'create-highlight'
  | 'create-rect'
  | 'create-text'
  | 'marquee'
  | 'none'
  | 'pan'

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

  if (
    config.gestures.pan &&
    (input.button === 1 || spaceDown || tool === 'pan')
  ) {
    return 'pan'
  }

  if (tool === 'rect' && config.gestures.createRect) {
    return 'create-rect'
  }

  if (tool === 'highlight' && config.gestures.createHighlight) {
    return 'create-highlight'
  }

  if (tool === 'arrow' && config.gestures.createArrow) {
    return 'create-arrow'
  }

  if (tool === 'text' && config.gestures.createText) {
    return 'create-text'
  }

  return config.gestures.marquee ? 'marquee' : 'none'
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

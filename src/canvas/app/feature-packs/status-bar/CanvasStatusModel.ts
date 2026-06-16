import { isCanvasCustomToolId } from '../../../core'
import {
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCES,
} from '../../../engine'
import type {
  CanvasInteractionKind,
  Tool,
} from '../../../entities'
import type {
  CanvasAppCustomCreationToolState,
} from '../../extensions/CanvasAppExtensionStateContracts'

export function getCanvasStatusModel({
  customTools,
  gesture,
  selectionLength,
  tool,
}: {
  customTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  selectionLength: number
  tool: Tool
}) {
  return {
    mode: getCanvasStatusMode({ customTools, gesture, tool }),
    selectionLength,
  }
}

function getCanvasStatusMode({
  customTools,
  gesture,
  tool,
}: {
  customTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  tool: Tool
}) {
  const gestureLabel = CANVAS_GESTURE_STATUS_LABELS[gesture]

  if (gestureLabel) {
    return gestureLabel
  }

  if (isCanvasCustomToolId(tool)) {
    return (
      customTools.find((customTool) => customTool.id === tool)
        ?.statusLabel ?? 'Canvas'
    )
  }

  return CANVAS_TOOL_AFFORDANCES[tool].statusLabel
}

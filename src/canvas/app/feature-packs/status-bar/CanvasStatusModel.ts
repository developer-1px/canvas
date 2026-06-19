import {
  getCanvasViewportScale,
  isCanvasCustomToolId,
} from '../../../core'
import {
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCES,
} from '../../../engine'
import type {
  CanvasInteractionKind,
  Tool,
  Viewport,
} from '../../../entities'
import type {
  CanvasAppCustomCreationToolState,
} from '../../extensions/CanvasAppExtensionStateContracts'

export function getCanvasStatusModel({
  customTools,
  gesture,
  selectionLength,
  tool,
  viewport,
}: {
  customTools: readonly CanvasAppCustomCreationToolState[]
  gesture: CanvasInteractionKind
  selectionLength: number
  tool: Tool
  viewport: Pick<Viewport, 'scale'>
}) {
  return {
    mode: getCanvasStatusMode({ customTools, gesture, tool }),
    scalePercent: getCanvasStatusScalePercent(viewport),
    selectionLength,
  }
}

function getCanvasStatusScalePercent(viewport: Pick<Viewport, 'scale'>) {
  return Math.round(getCanvasViewportScale(viewport) * 100)
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

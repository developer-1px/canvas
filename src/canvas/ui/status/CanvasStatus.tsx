import {
  CANVAS_GESTURE_STATUS_LABELS,
  CANVAS_TOOL_AFFORDANCES,
} from '../../engine/affordance/CanvasAffordances'
import type { CanvasInteractionKind, Tool } from '../../engine/primitives/CanvasPrimitives'

type CanvasStatusProps = {
  gesture: CanvasInteractionKind
  scale: number
  selectionLength: number
  tool: Tool
}

export function CanvasStatus({
  gesture,
  scale,
  selectionLength,
  tool,
}: CanvasStatusProps) {
  const mode =
    CANVAS_GESTURE_STATUS_LABELS[gesture] ??
    CANVAS_TOOL_AFFORDANCES[tool].statusLabel
  const selection =
    selectionLength === 0
      ? 'No selection'
      : selectionLength === 1
        ? '1 selected'
        : `${selectionLength} selected`

  return (
    <div className="canvas-status" aria-live="polite">
      <span>{mode}</span>
      <span>{selection}</span>
      <span>{Math.round(scale * 100)}%</span>
    </div>
  )
}

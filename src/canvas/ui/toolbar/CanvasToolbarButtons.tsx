import type { ReactNode } from 'react'
import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_TOOL_AFFORDANCES,
} from '../../engine/affordance/CanvasAffordances'
import type { Tool } from '../../engine/primitives/CanvasPrimitives'

type ToolButtonProps = {
  active: boolean
  affordance: (typeof CANVAS_TOOL_AFFORDANCES)[Tool]
  children: ReactNode
  onClick: () => void
}

export function ToolButton({
  active,
  affordance,
  children,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      className="tool-button"
      data-active={active}
      aria-label={affordance.ariaLabel}
      aria-pressed={active}
      title={affordance.title}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function ToolbarDivider() {
  return <span className="toolbar-divider" aria-hidden="true" />
}

export function CommandButton({
  children,
  command,
  disabled,
  onClick,
}: {
  children: ReactNode
  command: keyof typeof CANVAS_COMMAND_AFFORDANCES
  disabled: boolean
  onClick: () => void
}) {
  const affordance = CANVAS_COMMAND_AFFORDANCES[command]

  return (
    <button
      type="button"
      className="tool-button"
      disabled={disabled}
      aria-label={affordance.ariaLabel}
      title={affordance.title}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

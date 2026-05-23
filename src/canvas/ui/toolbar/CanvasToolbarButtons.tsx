import type { ReactNode } from 'react'
import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_TOOL_AFFORDANCES,
} from '../../engine'
import type { CanvasBuiltinTool } from '../../entities'

type ToolButtonProps = {
  active: boolean
  affordance: (typeof CANVAS_TOOL_AFFORDANCES)[CanvasBuiltinTool]
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

export function CustomToolButton({
  active,
  ariaLabel,
  label,
  onClick,
  title,
}: {
  active: boolean
  ariaLabel: string
  label: string
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      className="tool-button custom-tool-button"
      data-active={active}
      aria-label={ariaLabel}
      aria-pressed={active}
      title={title}
      onClick={onClick}
    >
      {label}
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

export function CustomCommandButton({
  ariaLabel,
  disabled,
  label,
  onClick,
  title,
}: {
  ariaLabel: string
  disabled: boolean
  label: string
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      className="tool-button custom-command-button"
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

import type { ReactNode } from 'react'
import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_TOOL_AFFORDANCES,
} from '../../../engine'
import type { CanvasBuiltinTool } from '../../../entities'
import {
  formatCanvasKeyboardShortcutAriaKey,
  type CanvasKeyboardShortcutChord,
} from '../../affordances/interaction/keyboard/CanvasKeyboardShortcutChords'
import { CANVAS_MENU_ITEM_PROPS } from './CanvasMenuRovingFocus'
import { CANVAS_TOOLBAR_ITEM_PROPS } from './CanvasToolbarRovingFocus'

export type CanvasToolbarButtonSurface = 'menu' | 'toolbar'

type ToolButtonProps = {
  active: boolean
  affordance: (typeof CANVAS_TOOL_AFFORDANCES)[CanvasBuiltinTool]
  children: ReactNode
  onClick: () => void
  surface?: CanvasToolbarButtonSurface
}

export function ToolButton({
  active,
  affordance,
  children,
  onClick,
  surface = 'toolbar',
}: ToolButtonProps) {
  return (
    <button
      {...getCanvasToolbarButtonSurfaceProps({ checked: active, surface })}
      type="button"
      className="tool-button"
      data-active={active}
      aria-label={affordance.ariaLabel}
      aria-keyshortcuts={getCanvasToolButtonAriaKeyshortcuts(
        affordance.keyboardShortcut,
      )}
      aria-pressed={surface === 'toolbar' ? active : undefined}
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
  shortcut,
  surface = 'toolbar',
  title,
}: {
  active: boolean
  ariaLabel: string
  label: string
  onClick: () => void
  shortcut?: CanvasKeyboardShortcutChord
  surface?: CanvasToolbarButtonSurface
  title: string
}) {
  return (
    <button
      {...getCanvasToolbarButtonSurfaceProps({ checked: active, surface })}
      type="button"
      className="tool-button custom-tool-button"
      data-active={active}
      aria-label={ariaLabel}
      aria-keyshortcuts={getCanvasToolButtonAriaKeyshortcuts(shortcut)}
      aria-pressed={surface === 'toolbar' ? active : undefined}
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
  surface = 'toolbar',
}: {
  children: ReactNode
  command: keyof typeof CANVAS_COMMAND_AFFORDANCES
  disabled: boolean
  onClick: () => void
  surface?: CanvasToolbarButtonSurface
}) {
  const affordance = CANVAS_COMMAND_AFFORDANCES[command]

  return (
    <button
      {...getCanvasToolbarButtonSurfaceProps({ surface })}
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
  surface = 'toolbar',
  title,
}: {
  ariaLabel: string
  disabled: boolean
  label: string
  onClick: () => void
  surface?: CanvasToolbarButtonSurface
  title: string
}) {
  return (
    <button
      {...getCanvasToolbarButtonSurfaceProps({ surface })}
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

function getCanvasToolbarButtonSurfaceProps({
  checked,
  surface,
}: {
  checked?: boolean
  surface: CanvasToolbarButtonSurface
}) {
  if (surface === 'menu') {
    return {
      ...CANVAS_MENU_ITEM_PROPS,
      role: checked === undefined ? 'menuitem' : 'menuitemcheckbox',
      'aria-checked': checked,
    } as const
  }

  return CANVAS_TOOLBAR_ITEM_PROPS
}

function getCanvasToolButtonAriaKeyshortcuts(
  shortcut: CanvasKeyboardShortcutChord | undefined,
) {
  return shortcut
    ? formatCanvasKeyboardShortcutAriaKey(shortcut)
    : undefined
}

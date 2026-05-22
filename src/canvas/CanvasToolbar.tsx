import type { ReactNode } from 'react'
import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_TOOL_AFFORDANCES,
  type CanvasAffordanceConfig,
} from './CanvasAffordances'
import type { Tool } from './CanvasPrimitives'
import {
  DeleteIcon,
  DuplicateIcon,
  GroupIcon,
  PanIcon,
  RedoIcon,
  RectIcon,
  SelectIcon,
  TextIcon,
  UndoIcon,
  UngroupIcon,
} from './CanvasIcons'

type CanvasToolbarProps = {
  canDelete: boolean
  canDuplicate: boolean
  canGroup: boolean
  canRedo: boolean
  canUndo: boolean
  canUngroup: boolean
  config: CanvasAffordanceConfig
  tool: Tool
  onDelete: () => void
  onDuplicate: () => void
  onGroup: () => void
  onRedo: () => void
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onUngroup: () => void
}

export function CanvasToolbar({
  canDelete,
  canDuplicate,
  canGroup,
  canRedo,
  canUndo,
  canUngroup,
  config,
  tool,
  onDelete,
  onDuplicate,
  onGroup,
  onRedo,
  onToolChange,
  onUndo,
  onUngroup,
}: CanvasToolbarProps) {
  const hasHistoryCommands = config.commands.undo || config.commands.redo
  const hasSelectionCommands =
    config.commands.duplicate || config.commands.delete
  const hasGroupingCommands = config.commands.group || config.commands.ungroup

  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      {config.tools.select ? (
        <ToolButton
          active={tool === 'select'}
          affordance={CANVAS_TOOL_AFFORDANCES.select}
          onClick={() => onToolChange('select')}
        >
          <SelectIcon />
        </ToolButton>
      ) : null}
      {config.tools.pan ? (
        <ToolButton
          active={tool === 'pan'}
          affordance={CANVAS_TOOL_AFFORDANCES.pan}
          onClick={() => onToolChange('pan')}
        >
          <PanIcon />
        </ToolButton>
      ) : null}
      {config.tools.rect ? (
        <ToolButton
          active={tool === 'rect'}
          affordance={CANVAS_TOOL_AFFORDANCES.rect}
          onClick={() => onToolChange('rect')}
        >
          <RectIcon />
        </ToolButton>
      ) : null}
      {config.tools.text ? (
        <ToolButton
          active={tool === 'text'}
          affordance={CANVAS_TOOL_AFFORDANCES.text}
          onClick={() => onToolChange('text')}
        >
          <TextIcon />
        </ToolButton>
      ) : null}

      {hasHistoryCommands ? <ToolbarDivider /> : null}
      {config.commands.undo ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canUndo}
          aria-label={CANVAS_COMMAND_AFFORDANCES.undo.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.undo.title}
          onClick={() => onUndo()}
        >
          <UndoIcon />
        </button>
      ) : null}
      {config.commands.redo ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canRedo}
          aria-label={CANVAS_COMMAND_AFFORDANCES.redo.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.redo.title}
          onClick={() => onRedo()}
        >
          <RedoIcon />
        </button>
      ) : null}

      {hasSelectionCommands ? <ToolbarDivider /> : null}
      {config.commands.duplicate ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canDuplicate}
          aria-label={CANVAS_COMMAND_AFFORDANCES.duplicate.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.duplicate.title}
          onClick={() => onDuplicate()}
        >
          <DuplicateIcon />
        </button>
      ) : null}
      {config.commands.delete ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canDelete}
          aria-label={CANVAS_COMMAND_AFFORDANCES.delete.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.delete.title}
          onClick={() => onDelete()}
        >
          <DeleteIcon />
        </button>
      ) : null}

      {hasGroupingCommands ? <ToolbarDivider /> : null}
      {config.commands.group ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canGroup}
          aria-label={CANVAS_COMMAND_AFFORDANCES.group.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.group.title}
          onClick={() => onGroup()}
        >
          <GroupIcon />
        </button>
      ) : null}
      {config.commands.ungroup ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canUngroup}
          aria-label={CANVAS_COMMAND_AFFORDANCES.ungroup.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.ungroup.title}
          onClick={() => onUngroup()}
        >
          <UngroupIcon />
        </button>
      ) : null}
    </div>
  )
}

type ToolButtonProps = {
  active: boolean
  affordance: (typeof CANVAS_TOOL_AFFORDANCES)[Tool]
  children: ReactNode
  onClick: () => void
}

function ToolButton({
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

function ToolbarDivider() {
  return <span className="toolbar-divider" aria-hidden="true" />
}

import type { ReactNode } from 'react'
import type {
  CanvasAlignMode,
  CanvasDistributeMode,
} from '../engine/CanvasCommandEngine'
import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_TOOL_AFFORDANCES,
  type CanvasAffordanceConfig,
} from '../engine/CanvasAffordances'
import type { Tool } from '../engine/CanvasPrimitives'
import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignMiddleIcon,
  AlignRightIcon,
  AlignTopIcon,
  DeleteIcon,
  DistributeHorizontalIcon,
  DistributeVerticalIcon,
  DuplicateIcon,
  GroupIcon,
  LockIcon,
  PanIcon,
  RedoIcon,
  RectIcon,
  SelectIcon,
  TextIcon,
  UndoIcon,
  UngroupIcon,
  UnlockIcon,
} from './CanvasIcons'

type CanvasToolbarProps = {
  canAlign: boolean
  canDelete: boolean
  canDistribute: boolean
  canDuplicate: boolean
  canGroup: boolean
  canLock: boolean
  canRedo: boolean
  canUndo: boolean
  canUngroup: boolean
  config: CanvasAffordanceConfig
  tool: Tool
  onAlign: (mode: CanvasAlignMode) => void
  onDelete: () => void
  onDistribute: (mode: CanvasDistributeMode) => void
  onDuplicate: () => void
  onGroup: () => void
  onLock: () => void
  onRedo: () => void
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onUngroup: () => void
  onUnlockAll: () => void
}

export function CanvasToolbar({
  canAlign,
  canDelete,
  canDistribute,
  canDuplicate,
  canGroup,
  canLock,
  canRedo,
  canUndo,
  canUngroup,
  config,
  tool,
  onAlign,
  onDelete,
  onDistribute,
  onDuplicate,
  onGroup,
  onLock,
  onRedo,
  onToolChange,
  onUndo,
  onUngroup,
  onUnlockAll,
}: CanvasToolbarProps) {
  const hasHistoryCommands = config.commands.undo || config.commands.redo
  const hasSelectionCommands =
    config.commands.duplicate || config.commands.delete
  const hasGroupingCommands = config.commands.group || config.commands.ungroup
  const hasLockCommands = config.commands.lockSelection || config.commands.unlockAll
  const hasAlignmentCommands =
    config.commands.alignLeft ||
    config.commands.alignCenter ||
    config.commands.alignRight ||
    config.commands.alignTop ||
    config.commands.alignMiddle ||
    config.commands.alignBottom ||
    config.commands.distributeHorizontal ||
    config.commands.distributeVertical

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

      {hasAlignmentCommands ? <ToolbarDivider /> : null}
      {config.commands.alignLeft ? (
        <CommandButton
          command="alignLeft"
          disabled={!canAlign}
          onClick={() => onAlign('alignLeft')}
        >
          <AlignLeftIcon />
        </CommandButton>
      ) : null}
      {config.commands.alignCenter ? (
        <CommandButton
          command="alignCenter"
          disabled={!canAlign}
          onClick={() => onAlign('alignCenter')}
        >
          <AlignCenterIcon />
        </CommandButton>
      ) : null}
      {config.commands.alignRight ? (
        <CommandButton
          command="alignRight"
          disabled={!canAlign}
          onClick={() => onAlign('alignRight')}
        >
          <AlignRightIcon />
        </CommandButton>
      ) : null}
      {config.commands.alignTop ? (
        <CommandButton
          command="alignTop"
          disabled={!canAlign}
          onClick={() => onAlign('alignTop')}
        >
          <AlignTopIcon />
        </CommandButton>
      ) : null}
      {config.commands.alignMiddle ? (
        <CommandButton
          command="alignMiddle"
          disabled={!canAlign}
          onClick={() => onAlign('alignMiddle')}
        >
          <AlignMiddleIcon />
        </CommandButton>
      ) : null}
      {config.commands.alignBottom ? (
        <CommandButton
          command="alignBottom"
          disabled={!canAlign}
          onClick={() => onAlign('alignBottom')}
        >
          <AlignBottomIcon />
        </CommandButton>
      ) : null}
      {config.commands.distributeHorizontal ? (
        <CommandButton
          command="distributeHorizontal"
          disabled={!canDistribute}
          onClick={() => onDistribute('distributeHorizontal')}
        >
          <DistributeHorizontalIcon />
        </CommandButton>
      ) : null}
      {config.commands.distributeVertical ? (
        <CommandButton
          command="distributeVertical"
          disabled={!canDistribute}
          onClick={() => onDistribute('distributeVertical')}
        >
          <DistributeVerticalIcon />
        </CommandButton>
      ) : null}

      {hasLockCommands ? <ToolbarDivider /> : null}
      {config.commands.lockSelection ? (
        <button
          type="button"
          className="tool-button"
          disabled={!canLock}
          aria-label={CANVAS_COMMAND_AFFORDANCES.lockSelection.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.lockSelection.title}
          onClick={() => onLock()}
        >
          <LockIcon />
        </button>
      ) : null}
      {config.commands.unlockAll ? (
        <button
          type="button"
          className="tool-button"
          aria-label={CANVAS_COMMAND_AFFORDANCES.unlockAll.ariaLabel}
          title={CANVAS_COMMAND_AFFORDANCES.unlockAll.title}
          onClick={() => onUnlockAll()}
        >
          <UnlockIcon />
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

function CommandButton({
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

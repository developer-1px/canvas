import {
  CANVAS_TOOL_AFFORDANCES,
  type CanvasAffordanceConfig,
  type CanvasAlignMode,
  type CanvasDistributeMode,
} from '../../engine'
import type { Tool } from '../../entities'
import {
  AlignBottomIcon,
  AlignCenterIcon,
  AlignLeftIcon,
  AlignMiddleIcon,
  AlignRightIcon,
  AlignTopIcon,
  ArrowIcon,
  DeleteIcon,
  DistributeHorizontalIcon,
  DistributeVerticalIcon,
  DuplicateIcon,
  GroupIcon,
  HighlighterIcon,
  LockIcon,
  MarkerIcon,
  PanIcon,
  RedoIcon,
  RectIcon,
  SelectIcon,
  TextIcon,
  UndoIcon,
  UngroupIcon,
  UnlockIcon,
} from '../icons/CanvasIcons'
import {
  CommandButton,
  ToolbarDivider,
  ToolButton,
} from './CanvasToolbarButtons'

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
      {config.tools.marker ? (
        <ToolButton
          active={tool === 'marker'}
          affordance={CANVAS_TOOL_AFFORDANCES.marker}
          onClick={() => onToolChange('marker')}
        >
          <MarkerIcon />
        </ToolButton>
      ) : null}
      {config.tools.highlight ? (
        <ToolButton
          active={tool === 'highlight'}
          affordance={CANVAS_TOOL_AFFORDANCES.highlight}
          onClick={() => onToolChange('highlight')}
        >
          <HighlighterIcon />
        </ToolButton>
      ) : null}
      {config.tools.arrow ? (
        <ToolButton
          active={tool === 'arrow'}
          affordance={CANVAS_TOOL_AFFORDANCES.arrow}
          onClick={() => onToolChange('arrow')}
        >
          <ArrowIcon />
        </ToolButton>
      ) : null}

      {hasHistoryCommands ? <ToolbarDivider /> : null}
      {config.commands.undo ? (
        <CommandButton
          command="undo"
          disabled={!canUndo}
          onClick={() => onUndo()}
        >
          <UndoIcon />
        </CommandButton>
      ) : null}
      {config.commands.redo ? (
        <CommandButton
          command="redo"
          disabled={!canRedo}
          onClick={() => onRedo()}
        >
          <RedoIcon />
        </CommandButton>
      ) : null}

      {hasSelectionCommands ? <ToolbarDivider /> : null}
      {config.commands.duplicate ? (
        <CommandButton
          command="duplicate"
          disabled={!canDuplicate}
          onClick={() => onDuplicate()}
        >
          <DuplicateIcon />
        </CommandButton>
      ) : null}
      {config.commands.delete ? (
        <CommandButton
          command="delete"
          disabled={!canDelete}
          onClick={() => onDelete()}
        >
          <DeleteIcon />
        </CommandButton>
      ) : null}

      {hasGroupingCommands ? <ToolbarDivider /> : null}
      {config.commands.group ? (
        <CommandButton
          command="group"
          disabled={!canGroup}
          onClick={() => onGroup()}
        >
          <GroupIcon />
        </CommandButton>
      ) : null}
      {config.commands.ungroup ? (
        <CommandButton
          command="ungroup"
          disabled={!canUngroup}
          onClick={() => onUngroup()}
        >
          <UngroupIcon />
        </CommandButton>
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
        <CommandButton
          command="lockSelection"
          disabled={!canLock}
          onClick={() => onLock()}
        >
          <LockIcon />
        </CommandButton>
      ) : null}
      {config.commands.unlockAll ? (
        <CommandButton
          command="unlockAll"
          disabled={false}
          onClick={() => onUnlockAll()}
        >
          <UnlockIcon />
        </CommandButton>
      ) : null}
    </div>
  )
}

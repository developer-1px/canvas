import {
  Fragment,
  type ReactNode,
} from 'react'
import {
  CANVAS_TOOL_AFFORDANCES,
  type CanvasAffordanceConfig,
  type CanvasAlignMode,
  type CanvasCommandAvailability,
  type CanvasCommandId,
  type CanvasDistributeMode,
} from '../../engine'
import type {
  CanvasBuiltinTool,
  Tool,
} from '../../entities'
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
  CustomCommandButton,
  CustomToolButton,
  ToolbarDivider,
  ToolButton,
} from './CanvasToolbarButtons'
import {
  getCanvasToolbarGroups,
  type CanvasToolbarCommandAction,
  type CanvasToolbarCustomCommand,
  type CanvasToolbarCustomTool,
  type CanvasToolbarItem,
} from './CanvasToolbarItems'

type CanvasToolbarProps = {
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  customTools: readonly CanvasToolbarCustomTool[]
  tool: Tool
  onAlign: (mode: CanvasAlignMode) => void
  onDelete: () => void
  onDistribute: (mode: CanvasDistributeMode) => void
  onDuplicate: () => void
  onCustomCommand: (commandId: string) => void
  onGroup: () => void
  onLock: () => void
  onRedo: () => void
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onUngroup: () => void
  onUnlockAll: () => void
}

const CANVAS_TOOLBAR_TOOL_ICONS = {
  arrow: ArrowIcon,
  highlight: HighlighterIcon,
  marker: MarkerIcon,
  pan: PanIcon,
  rect: RectIcon,
  select: SelectIcon,
  text: TextIcon,
} satisfies Record<CanvasBuiltinTool, () => ReactNode>

const CANVAS_TOOLBAR_COMMAND_ICONS: Partial<
  Record<CanvasCommandId, () => ReactNode>
> = {
  alignBottom: AlignBottomIcon,
  alignCenter: AlignCenterIcon,
  alignLeft: AlignLeftIcon,
  alignMiddle: AlignMiddleIcon,
  alignRight: AlignRightIcon,
  alignTop: AlignTopIcon,
  delete: DeleteIcon,
  duplicate: DuplicateIcon,
  distributeHorizontal: DistributeHorizontalIcon,
  distributeVertical: DistributeVerticalIcon,
  group: GroupIcon,
  lockSelection: LockIcon,
  redo: RedoIcon,
  undo: UndoIcon,
  ungroup: UngroupIcon,
  unlockAll: UnlockIcon,
}

export function CanvasToolbar(props: CanvasToolbarProps) {
  const groups = getCanvasToolbarGroups(props)

  return (
    <div className="toolbar" role="toolbar" aria-label="Tools">
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? <ToolbarDivider /> : null}
          {group.items.map((item) => renderCanvasToolbarItem(item, props))}
        </Fragment>
      ))}
    </div>
  )
}

function renderCanvasToolbarItem(
  item: CanvasToolbarItem,
  props: CanvasToolbarProps,
) {
  if (item.kind === 'builtin-tool') {
    const Icon = CANVAS_TOOLBAR_TOOL_ICONS[item.tool]

    return (
      <ToolButton
        key={item.tool}
        active={item.active}
        affordance={CANVAS_TOOL_AFFORDANCES[item.tool]}
        onClick={() => props.onToolChange(item.tool)}
      >
        <Icon />
      </ToolButton>
    )
  }

  if (item.kind === 'custom-tool') {
    return (
      <CustomToolButton
        key={item.tool}
        active={item.active}
        ariaLabel={item.ariaLabel}
        label={item.label}
        title={item.title}
        onClick={() => props.onToolChange(item.tool)}
      />
    )
  }

  if (item.kind === 'custom-command') {
    return (
      <CustomCommandButton
        key={item.id}
        ariaLabel={item.ariaLabel}
        disabled={item.disabled}
        label={item.label}
        title={item.title}
        onClick={() => props.onCustomCommand(item.id)}
      />
    )
  }

  const Icon = CANVAS_TOOLBAR_COMMAND_ICONS[item.command]

  return (
    <CommandButton
      key={item.command}
      command={item.command}
      disabled={item.disabled}
      onClick={() => runCanvasToolbarCommandAction(item.action, props)}
    >
      {Icon ? <Icon /> : null}
    </CommandButton>
  )
}

function runCanvasToolbarCommandAction(
  action: CanvasToolbarCommandAction,
  props: CanvasToolbarProps,
) {
  switch (action.kind) {
    case 'align':
      props.onAlign(action.mode)
      return
    case 'delete':
      props.onDelete()
      return
    case 'distribute':
      props.onDistribute(action.mode)
      return
    case 'duplicate':
      props.onDuplicate()
      return
    case 'group':
      props.onGroup()
      return
    case 'lock':
      props.onLock()
      return
    case 'redo':
      props.onRedo()
      return
    case 'undo':
      props.onUndo()
      return
    case 'ungroup':
      props.onUngroup()
      return
    case 'unlock-all':
      props.onUnlockAll()
      return
  }

  return assertUnhandledCanvasToolbarCommandAction(action)
}

function assertUnhandledCanvasToolbarCommandAction(
  action: never,
): never {
  throw new Error(`Unhandled canvas toolbar command action: ${String(action)}`)
}

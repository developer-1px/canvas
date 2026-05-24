import type { ReactNode } from 'react'
import {
  CANVAS_TOOL_AFFORDANCES,
  type CanvasCommandId,
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
  CommentIcon,
  DeleteIcon,
  DistributeHorizontalIcon,
  DistributeVerticalIcon,
  DuplicateIcon,
  GroupIcon,
  HighlighterIcon,
  LockIcon,
  MarkerIcon,
  PanIcon,
  RectIcon,
  RedoIcon,
  SelectIcon,
  StickyNoteIcon,
  TextIcon,
  UndoIcon,
  UngroupIcon,
  UnlockIcon,
} from '../icons/CanvasIcons'
import {
  CommandButton,
  CustomCommandButton,
  CustomToolButton,
  ToolButton,
} from './CanvasToolbarButtons'
import type { CanvasToolbarCommandHandlers } from './CanvasToolbarCommandContracts'
import { runCanvasToolbarCommandAction } from './CanvasToolbarCommandDispatch'
import type { CanvasToolbarItem } from './CanvasToolbarItems'

export type CanvasToolbarItemRenderContext = {
  commandHandlers: CanvasToolbarCommandHandlers
  onCustomCommand: (commandId: string) => void
  onToolChange: (tool: Tool) => void
}

type CanvasToolbarItemKind = CanvasToolbarItem['kind']

type CanvasToolbarItemRenderStrategy<TKind extends CanvasToolbarItemKind> =
  (args: {
    context: CanvasToolbarItemRenderContext
    item: Extract<CanvasToolbarItem, { kind: TKind }>
  }) => ReactNode

type CanvasToolbarItemRenderStrategies = {
  [TKind in CanvasToolbarItemKind]: CanvasToolbarItemRenderStrategy<TKind>
}

type CanvasToolbarAnyItemRenderStrategy = (args: {
  context: CanvasToolbarItemRenderContext
  item: CanvasToolbarItem
}) => ReactNode

const CANVAS_TOOLBAR_TOOL_ICONS = {
  arrow: ArrowIcon,
  comment: CommentIcon,
  highlight: HighlighterIcon,
  marker: MarkerIcon,
  pan: PanIcon,
  rect: RectIcon,
  select: SelectIcon,
  sticky: StickyNoteIcon,
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

const CANVAS_TOOLBAR_ITEM_RENDER_STRATEGIES = Object.freeze({
  'builtin-tool': renderCanvasToolbarBuiltinToolItem,
  command: renderCanvasToolbarCommandItem,
  'custom-command': renderCanvasToolbarCustomCommandItem,
  'custom-tool': renderCanvasToolbarCustomToolItem,
} satisfies CanvasToolbarItemRenderStrategies)

export function renderCanvasToolbarItemByKind({
  context,
  item,
}: {
  context: CanvasToolbarItemRenderContext
  item: CanvasToolbarItem
}) {
  const renderItem = CANVAS_TOOLBAR_ITEM_RENDER_STRATEGIES[
    item.kind
  ] as CanvasToolbarAnyItemRenderStrategy

  return renderItem({ context, item })
}

function renderCanvasToolbarBuiltinToolItem({
  context,
  item,
}: {
  context: CanvasToolbarItemRenderContext
  item: Extract<CanvasToolbarItem, { kind: 'builtin-tool' }>
}) {
  const Icon = CANVAS_TOOLBAR_TOOL_ICONS[item.tool]

  return (
    <ToolButton
      key={item.tool}
      active={item.active}
      affordance={CANVAS_TOOL_AFFORDANCES[item.tool]}
      onClick={() => context.onToolChange(item.tool)}
    >
      <Icon />
    </ToolButton>
  )
}

function renderCanvasToolbarCustomToolItem({
  context,
  item,
}: {
  context: CanvasToolbarItemRenderContext
  item: Extract<CanvasToolbarItem, { kind: 'custom-tool' }>
}) {
  return (
    <CustomToolButton
      key={item.tool}
      active={item.active}
      ariaLabel={item.ariaLabel}
      label={item.label}
      title={item.title}
      onClick={() => context.onToolChange(item.tool)}
    />
  )
}

function renderCanvasToolbarCustomCommandItem({
  context,
  item,
}: {
  context: CanvasToolbarItemRenderContext
  item: Extract<CanvasToolbarItem, { kind: 'custom-command' }>
}) {
  return (
    <CustomCommandButton
      key={item.id}
      ariaLabel={item.ariaLabel}
      disabled={item.disabled}
      label={item.label}
      title={item.title}
      onClick={() => context.onCustomCommand(item.id)}
    />
  )
}

function renderCanvasToolbarCommandItem({
  context,
  item,
}: {
  context: CanvasToolbarItemRenderContext
  item: Extract<CanvasToolbarItem, { kind: 'command' }>
}) {
  const Icon = CANVAS_TOOLBAR_COMMAND_ICONS[item.command]

  return (
    <CommandButton
      key={item.command}
      command={item.command}
      disabled={item.disabled}
      onClick={() =>
        runCanvasToolbarCommandAction({
          action: item.action,
          handlers: context.commandHandlers,
        })}
    >
      {Icon ? <Icon /> : null}
    </CommandButton>
  )
}

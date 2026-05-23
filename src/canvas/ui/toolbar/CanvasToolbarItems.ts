import type {
  CanvasAffordanceConfig,
  CanvasAlignMode,
  CanvasCommandId,
  CanvasDistributeMode,
} from '../../engine'
import type {
  CanvasBuiltinTool,
  CanvasCustomToolId,
  Tool,
} from '../../entities'

export type CanvasToolbarCustomCommand = {
  ariaLabel: string
  disabled: boolean
  id: string
  label: string
  title: string
}

export type CanvasToolbarCustomTool = {
  ariaLabel: string
  id: CanvasCustomToolId
  label: string
  title: string
}

export type CanvasToolbarCommandAction =
  | { kind: 'align'; mode: CanvasAlignMode }
  | { kind: 'delete' }
  | { kind: 'distribute'; mode: CanvasDistributeMode }
  | { kind: 'duplicate' }
  | { kind: 'group' }
  | { kind: 'lock' }
  | { kind: 'redo' }
  | { kind: 'undo' }
  | { kind: 'ungroup' }
  | { kind: 'unlock-all' }

export type CanvasToolbarItem =
  | {
      active: boolean
      kind: 'builtin-tool'
      tool: CanvasBuiltinTool
    }
  | {
      active: boolean
      ariaLabel: string
      kind: 'custom-tool'
      label: string
      title: string
      tool: CanvasCustomToolId
    }
  | {
      action: CanvasToolbarCommandAction
      command: CanvasCommandId
      disabled: boolean
      kind: 'command'
    }
  | {
      ariaLabel: string
      disabled: boolean
      id: string
      kind: 'custom-command'
      label: string
      title: string
    }

export type CanvasToolbarGroupId =
  | 'tools'
  | 'history'
  | 'selection'
  | 'grouping'
  | 'alignment'
  | 'lock'
  | 'custom-commands'

export type CanvasToolbarGroup = {
  id: CanvasToolbarGroupId
  items: CanvasToolbarItem[]
}

export type CanvasToolbarItemsInput = {
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
  customCommands: readonly CanvasToolbarCustomCommand[]
  customTools: readonly CanvasToolbarCustomTool[]
  tool: Tool
}

const CANVAS_TOOLBAR_BUILTIN_TOOLS = [
  'select',
  'pan',
  'rect',
  'text',
  'marker',
  'highlight',
  'arrow',
] as const satisfies readonly CanvasBuiltinTool[]

export function getCanvasToolbarGroups({
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
  customCommands,
  customTools,
  tool,
}: CanvasToolbarItemsInput): CanvasToolbarGroup[] {
  const groups: CanvasToolbarGroup[] = []

  pushCanvasToolbarGroup(groups, {
    id: 'tools',
    items: [
      ...CANVAS_TOOLBAR_BUILTIN_TOOLS
        .filter((builtinTool) => config.tools[builtinTool])
        .map((builtinTool) => ({
          active: tool === builtinTool,
          kind: 'builtin-tool' as const,
          tool: builtinTool,
        })),
      ...customTools.map((customTool) => ({
        active: tool === customTool.id,
        ariaLabel: customTool.ariaLabel,
        kind: 'custom-tool' as const,
        label: customTool.label,
        title: customTool.title,
        tool: customTool.id,
      })),
    ],
  })

  pushCanvasToolbarGroup(groups, {
    id: 'history',
    items: [
      config.commands.undo
        ? getCanvasToolbarCommandItem({
            action: { kind: 'undo' },
            command: 'undo',
            disabled: !canUndo,
          })
        : null,
      config.commands.redo
        ? getCanvasToolbarCommandItem({
            action: { kind: 'redo' },
            command: 'redo',
            disabled: !canRedo,
          })
        : null,
    ],
  })

  pushCanvasToolbarGroup(groups, {
    id: 'selection',
    items: [
      config.commands.duplicate
        ? getCanvasToolbarCommandItem({
            action: { kind: 'duplicate' },
            command: 'duplicate',
            disabled: !canDuplicate,
          })
        : null,
      config.commands.delete
        ? getCanvasToolbarCommandItem({
            action: { kind: 'delete' },
            command: 'delete',
            disabled: !canDelete,
          })
        : null,
    ],
  })

  pushCanvasToolbarGroup(groups, {
    id: 'grouping',
    items: [
      config.commands.group
        ? getCanvasToolbarCommandItem({
            action: { kind: 'group' },
            command: 'group',
            disabled: !canGroup,
          })
        : null,
      config.commands.ungroup
        ? getCanvasToolbarCommandItem({
            action: { kind: 'ungroup' },
            command: 'ungroup',
            disabled: !canUngroup,
          })
        : null,
    ],
  })

  pushCanvasToolbarGroup(groups, {
    id: 'alignment',
    items: [
      getCanvasToolbarAlignItem('alignLeft', canAlign, config),
      getCanvasToolbarAlignItem('alignCenter', canAlign, config),
      getCanvasToolbarAlignItem('alignRight', canAlign, config),
      getCanvasToolbarAlignItem('alignTop', canAlign, config),
      getCanvasToolbarAlignItem('alignMiddle', canAlign, config),
      getCanvasToolbarAlignItem('alignBottom', canAlign, config),
      getCanvasToolbarDistributeItem(
        'distributeHorizontal',
        canDistribute,
        config,
      ),
      getCanvasToolbarDistributeItem(
        'distributeVertical',
        canDistribute,
        config,
      ),
    ],
  })

  pushCanvasToolbarGroup(groups, {
    id: 'lock',
    items: [
      config.commands.lockSelection
        ? getCanvasToolbarCommandItem({
            action: { kind: 'lock' },
            command: 'lockSelection',
            disabled: !canLock,
          })
        : null,
      config.commands.unlockAll
        ? getCanvasToolbarCommandItem({
            action: { kind: 'unlock-all' },
            command: 'unlockAll',
            disabled: false,
          })
        : null,
    ],
  })

  pushCanvasToolbarGroup(groups, {
    id: 'custom-commands',
    items: customCommands.map((command) => ({
      ariaLabel: command.ariaLabel,
      disabled: command.disabled,
      id: command.id,
      kind: 'custom-command',
      label: command.label,
      title: command.title,
    })),
  })

  return groups
}

function pushCanvasToolbarGroup(
  groups: CanvasToolbarGroup[],
  group: {
    id: CanvasToolbarGroupId
    items: Array<CanvasToolbarItem | null>
  },
) {
  const items = group.items.filter(
    (item): item is CanvasToolbarItem => item !== null,
  )

  if (items.length > 0) {
    groups.push({ id: group.id, items })
  }
}

function getCanvasToolbarCommandItem({
  action,
  command,
  disabled,
}: {
  action: CanvasToolbarCommandAction
  command: CanvasCommandId
  disabled: boolean
}): CanvasToolbarItem {
  return {
    action,
    command,
    disabled,
    kind: 'command',
  }
}

function getCanvasToolbarAlignItem(
  command: CanvasAlignMode,
  canAlign: boolean,
  config: CanvasAffordanceConfig,
) {
  return config.commands[command]
    ? getCanvasToolbarCommandItem({
        action: { kind: 'align', mode: command },
        command,
        disabled: !canAlign,
      })
    : null
}

function getCanvasToolbarDistributeItem(
  command: CanvasDistributeMode,
  canDistribute: boolean,
  config: CanvasAffordanceConfig,
) {
  return config.commands[command]
    ? getCanvasToolbarCommandItem({
        action: { kind: 'distribute', mode: command },
        command,
        disabled: !canDistribute,
      })
    : null
}

import type {
  CanvasAffordanceConfig,
  CanvasAlignMode,
  CanvasCommandId,
  CanvasDistributeMode,
} from '../../engine'

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

export type CanvasToolbarCommandItem = {
  action: CanvasToolbarCommandAction
  command: CanvasCommandId
  disabled: boolean
  kind: 'command'
}

export type CanvasToolbarCommandGroupId =
  | 'history'
  | 'selection'
  | 'grouping'
  | 'alignment'
  | 'lock'

export type CanvasToolbarCommandGroup = {
  id: CanvasToolbarCommandGroupId
  items: CanvasToolbarCommandItem[]
}

export type CanvasToolbarCommandItemsInput = {
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
}

export function getCanvasToolbarCommandGroups({
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
}: CanvasToolbarCommandItemsInput): CanvasToolbarCommandGroup[] {
  const groups: CanvasToolbarCommandGroup[] = []

  pushCanvasToolbarCommandGroup(groups, {
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

  pushCanvasToolbarCommandGroup(groups, {
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

  pushCanvasToolbarCommandGroup(groups, {
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

  pushCanvasToolbarCommandGroup(groups, {
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

  pushCanvasToolbarCommandGroup(groups, {
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

  return groups
}

function pushCanvasToolbarCommandGroup(
  groups: CanvasToolbarCommandGroup[],
  group: {
    id: CanvasToolbarCommandGroupId
    items: Array<CanvasToolbarCommandItem | null>
  },
) {
  const items = group.items.filter(
    (item): item is CanvasToolbarCommandItem => item !== null,
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
}): CanvasToolbarCommandItem {
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

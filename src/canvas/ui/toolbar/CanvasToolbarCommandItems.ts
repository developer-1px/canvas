import type {
  CanvasAffordanceConfig,
  CanvasAlignMode,
  CanvasCommandAvailability,
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
  availability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
}

export function getCanvasToolbarCommandGroups({
  availability,
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
            disabled: !availability.undo,
          })
        : null,
      config.commands.redo
        ? getCanvasToolbarCommandItem({
            action: { kind: 'redo' },
            command: 'redo',
            disabled: !availability.redo,
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
            disabled: !availability.duplicate,
          })
        : null,
      config.commands.delete
        ? getCanvasToolbarCommandItem({
            action: { kind: 'delete' },
            command: 'delete',
            disabled: !availability.delete,
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
            disabled: !availability.group,
          })
        : null,
      config.commands.ungroup
        ? getCanvasToolbarCommandItem({
            action: { kind: 'ungroup' },
            command: 'ungroup',
            disabled: !availability.ungroup,
          })
        : null,
    ],
  })

  pushCanvasToolbarCommandGroup(groups, {
    id: 'alignment',
    items: [
      getCanvasToolbarAlignItem('alignLeft', availability, config),
      getCanvasToolbarAlignItem('alignCenter', availability, config),
      getCanvasToolbarAlignItem('alignRight', availability, config),
      getCanvasToolbarAlignItem('alignTop', availability, config),
      getCanvasToolbarAlignItem('alignMiddle', availability, config),
      getCanvasToolbarAlignItem('alignBottom', availability, config),
      getCanvasToolbarDistributeItem(
        'distributeHorizontal',
        availability,
        config,
      ),
      getCanvasToolbarDistributeItem(
        'distributeVertical',
        availability,
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
            disabled: !availability.lockSelection,
          })
        : null,
      config.commands.unlockAll
        ? getCanvasToolbarCommandItem({
            action: { kind: 'unlock-all' },
            command: 'unlockAll',
            disabled: !availability.unlockAll,
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
  availability: CanvasCommandAvailability,
  config: CanvasAffordanceConfig,
) {
  return config.commands[command]
    ? getCanvasToolbarCommandItem({
        action: { kind: 'align', mode: command },
        command,
        disabled: !availability[command],
      })
    : null
}

function getCanvasToolbarDistributeItem(
  command: CanvasDistributeMode,
  availability: CanvasCommandAvailability,
  config: CanvasAffordanceConfig,
) {
  return config.commands[command]
    ? getCanvasToolbarCommandItem({
        action: { kind: 'distribute', mode: command },
        command,
        disabled: !availability[command],
      })
    : null
}

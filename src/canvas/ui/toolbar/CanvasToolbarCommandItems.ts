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

type CanvasToolbarCommandDescriptor = {
  action: CanvasToolbarCommandAction
  command: CanvasToolbarAvailableCommandId
}

type CanvasToolbarAvailableCommandId =
  keyof CanvasCommandAvailability & CanvasCommandId

type CanvasToolbarCommandGroupDescriptor = {
  commands: readonly CanvasToolbarCommandDescriptor[]
  id: CanvasToolbarCommandGroupId
}

const CANVAS_TOOLBAR_COMMAND_GROUPS = [
  {
    id: 'history',
    commands: [
      { action: { kind: 'undo' }, command: 'undo' },
      { action: { kind: 'redo' }, command: 'redo' },
    ],
  },
  {
    id: 'selection',
    commands: [
      { action: { kind: 'duplicate' }, command: 'duplicate' },
      { action: { kind: 'delete' }, command: 'delete' },
    ],
  },
  {
    id: 'grouping',
    commands: [
      { action: { kind: 'group' }, command: 'group' },
      { action: { kind: 'ungroup' }, command: 'ungroup' },
    ],
  },
  {
    id: 'alignment',
    commands: [
      {
        action: { kind: 'align', mode: 'alignLeft' },
        command: 'alignLeft',
      },
      {
        action: { kind: 'align', mode: 'alignCenter' },
        command: 'alignCenter',
      },
      {
        action: { kind: 'align', mode: 'alignRight' },
        command: 'alignRight',
      },
      { action: { kind: 'align', mode: 'alignTop' }, command: 'alignTop' },
      {
        action: { kind: 'align', mode: 'alignMiddle' },
        command: 'alignMiddle',
      },
      {
        action: { kind: 'align', mode: 'alignBottom' },
        command: 'alignBottom',
      },
      {
        action: { kind: 'distribute', mode: 'distributeHorizontal' },
        command: 'distributeHorizontal',
      },
      {
        action: { kind: 'distribute', mode: 'distributeVertical' },
        command: 'distributeVertical',
      },
    ],
  },
  {
    id: 'lock',
    commands: [
      { action: { kind: 'lock' }, command: 'lockSelection' },
      { action: { kind: 'unlock-all' }, command: 'unlockAll' },
    ],
  },
] as const satisfies readonly CanvasToolbarCommandGroupDescriptor[]

export function getCanvasToolbarCommandGroups({
  availability,
  config,
}: CanvasToolbarCommandItemsInput): CanvasToolbarCommandGroup[] {
  const groups: CanvasToolbarCommandGroup[] = []

  for (const group of CANVAS_TOOLBAR_COMMAND_GROUPS) {
    pushCanvasToolbarCommandGroup(groups, {
      id: group.id,
      items: group.commands.map((command) =>
        getCanvasToolbarCommandItem({ availability, command, config }),
      ),
    })
  }

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
  availability,
  command: descriptor,
  config,
}: {
  availability: CanvasCommandAvailability
  command: CanvasToolbarCommandDescriptor
  config: CanvasAffordanceConfig
}): CanvasToolbarCommandItem | null {
  if (!config.commands[descriptor.command]) {
    return null
  }

  return {
    action: descriptor.action,
    command: descriptor.command,
    disabled: !availability[descriptor.command],
    kind: 'command',
  }
}

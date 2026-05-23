import type {
  CanvasAffordanceConfig,
  CanvasCommandAvailability,
} from '../../engine'
import {
  CANVAS_TOOLBAR_COMMAND_GROUPS,
  type CanvasToolbarCommandAction,
  type CanvasToolbarCommandDescriptor,
  type CanvasToolbarCommandGroupId,
} from './CanvasToolbarCommandCatalog'

export type {
  CanvasToolbarCommandAction,
  CanvasToolbarCommandGroupId,
} from './CanvasToolbarCommandCatalog'

export type CanvasToolbarCommandItem = {
  action: CanvasToolbarCommandAction
  command: CanvasToolbarCommandDescriptor['command']
  disabled: boolean
  kind: 'command'
}

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

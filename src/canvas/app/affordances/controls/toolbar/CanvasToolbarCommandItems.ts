import type {
  CanvasAffordanceConfig,
  CanvasCommandAvailability,
} from '../../../../engine'
import {
  CANVAS_TOOLBAR_COMMAND_GROUPS,
  type CanvasFeatureCommandSurface,
  type CanvasToolbarCommandAction,
  type CanvasToolbarCommandDescriptor,
  type CanvasToolbarCommandGroupId,
} from './CanvasToolbarCommandCatalog'

export type {
  CanvasFeatureCommandSurface,
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
  includeDisabled?: boolean
  surface: CanvasFeatureCommandSurface
}

export function getCanvasToolbarCommandGroups({
  availability,
  config,
  includeDisabled = true,
  surface,
}: CanvasToolbarCommandItemsInput): CanvasToolbarCommandGroup[] {
  const groups: CanvasToolbarCommandGroup[] = []

  for (const group of CANVAS_TOOLBAR_COMMAND_GROUPS) {
    pushCanvasToolbarCommandGroup(groups, {
      id: group.id,
      items: group.commands.map((command) =>
        getCanvasToolbarCommandItem({
          availability,
          command,
          config,
          includeDisabled,
          surface,
        }),
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
  includeDisabled,
  surface,
}: {
  availability: CanvasCommandAvailability
  command: CanvasToolbarCommandDescriptor
  config: CanvasAffordanceConfig
  includeDisabled: boolean
  surface: CanvasFeatureCommandSurface
}): CanvasToolbarCommandItem | null {
  if (!descriptor.surfaces.includes(surface) || !config.commands[descriptor.command]) {
    return null
  }

  const disabled = !availability[descriptor.command]

  if (disabled && !includeDisabled) {
    return null
  }

  return {
    action: descriptor.action,
    command: descriptor.command,
    disabled,
    kind: 'command',
  }
}

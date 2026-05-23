import type {
  CanvasAffordanceConfig,
  CanvasCommandAvailability,
} from '../../engine'
import type { Tool } from '../../entities'
import {
  getCanvasToolbarCommandGroups,
  type CanvasToolbarCommandGroupId,
  type CanvasToolbarCommandItem,
} from './CanvasToolbarCommandItems'
import {
  getCanvasToolbarToolItems,
  type CanvasToolbarCustomTool,
  type CanvasToolbarToolItem,
} from './CanvasToolbarToolItems'

export type { CanvasToolbarCommandAction } from './CanvasToolbarCommandItems'
export type { CanvasToolbarCustomTool } from './CanvasToolbarToolItems'

export type CanvasToolbarCustomCommand = {
  ariaLabel: string
  disabled: boolean
  id: string
  label: string
  title: string
}

export type CanvasToolbarItem =
  | CanvasToolbarToolItem
  | CanvasToolbarCommandItem
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
  | CanvasToolbarCommandGroupId
  | 'custom-commands'

export type CanvasToolbarGroup = {
  id: CanvasToolbarGroupId
  items: CanvasToolbarItem[]
}

export type CanvasToolbarItemsInput = {
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasToolbarCustomCommand[]
  customTools: readonly CanvasToolbarCustomTool[]
  tool: Tool
}

export function getCanvasToolbarGroups({
  commandAvailability,
  config,
  customCommands,
  customTools,
  tool,
}: CanvasToolbarItemsInput): CanvasToolbarGroup[] {
  const groups: CanvasToolbarGroup[] = []

  pushCanvasToolbarGroup(groups, {
    id: 'tools',
    items: getCanvasToolbarToolItems({ config, customTools, tool }),
  })

  groups.push(...getCanvasToolbarCommandGroups({
    availability: commandAvailability,
    config,
  }))

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

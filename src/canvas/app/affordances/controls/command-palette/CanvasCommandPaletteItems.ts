import {
  CANVAS_COMMAND_AFFORDANCES,
  CANVAS_TOOL_AFFORDANCE_ORDER,
  CANVAS_TOOL_AFFORDANCES,
  type CanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../../engine'
import type { CanvasViewportZoomDirection } from '../../../../core'
import type {
  CanvasComponentKind,
  Tool,
} from '../../../../entities'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../../../extensions/CanvasAppExtensionStateContracts'
import {
  CANVAS_TOOLBAR_COMMAND_GROUPS,
} from '../toolbar/CanvasToolbarCommandCatalog'
import type {
  CanvasToolbarCommandHandlers,
} from '../toolbar/CanvasToolbarCommandContracts'
import {
  runCanvasToolbarCommandAction,
} from '../toolbar/CanvasToolbarCommandDispatch'
import {
  getCanvasAppCommandMapping,
  getCanvasAppCommandMappingShortcut,
} from '../../commands/CanvasAppCommandRegistry'

export type CanvasCommandPaletteItem = {
  disabled?: boolean
  id: string
  section: string
  shortcut?: string
  title: string
  onSelect: () => void
}

export type CanvasCommandPaletteComponent = {
  id: CanvasComponentKind
  title: string
}

export type CanvasCommandPaletteItemsInput = {
  commandAvailability: CanvasCommandAvailability
  commandHandlers: CanvasToolbarCommandHandlers
  components: readonly CanvasCommandPaletteComponent[]
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  selection: readonly string[]
  onCustomCommand: (commandId: string) => void
  onFitItems: (ids?: string[]) => void
  onInsertComponent: (component: CanvasComponentKind) => void
  onToolChange: (tool: Tool) => void
  onViewportReset: () => void
  onZoom: (direction: CanvasViewportZoomDirection) => void
}

export function getCanvasCommandPaletteItems({
  commandAvailability,
  commandHandlers,
  components,
  config,
  customCommands,
  customTools,
  onCustomCommand,
  onFitItems,
  onInsertComponent,
  onToolChange,
  onViewportReset,
  onZoom,
  selection,
}: CanvasCommandPaletteItemsInput): CanvasCommandPaletteItem[] {
  return [
    ...getCanvasCommandPaletteToolItems({
      config,
      customTools,
      onToolChange,
    }),
    ...getCanvasCommandPaletteComponentItems({
      components,
      onInsertComponent,
    }),
    ...getCanvasCommandPaletteCommandItems({
      commandAvailability,
      commandHandlers,
      config,
    }),
    ...getCanvasCommandPaletteCustomCommandItems({
      customCommands,
      onCustomCommand,
    }),
    ...getCanvasCommandPaletteViewportItems({
      config,
      onFitItems,
      onViewportReset,
      onZoom,
      selection,
    }),
  ]
}

export function filterCanvasCommandPaletteItems(
  items: readonly CanvasCommandPaletteItem[],
  query: string,
) {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) {
    return [...items]
  }

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.section,
      item.shortcut ?? '',
    ].join(' ').toLowerCase()

    return terms.every((term) => haystack.includes(term))
  })
}

function getCanvasCommandPaletteToolItems({
  config,
  customTools,
  onToolChange,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'config' | 'customTools' | 'onToolChange'
>): CanvasCommandPaletteItem[] {
  return [
    ...CANVAS_TOOL_AFFORDANCE_ORDER
      .filter((tool) => config.tools[tool])
      .map((tool) => {
        const affordance = CANVAS_TOOL_AFFORDANCES[tool]

        return {
          id: `tool:${tool}`,
          section: 'Tools',
          shortcut: affordance.shortcut,
          title: getCanvasCommandPaletteTitle(affordance.title),
          onSelect: () => onToolChange(tool),
        } satisfies CanvasCommandPaletteItem
      }),
    ...customTools.map((tool) => ({
      id: `tool:${tool.id}`,
      section: 'Tools',
      shortcut: formatCanvasCommandPaletteShortcut(tool.shortcut),
      title: tool.title,
      onSelect: () => onToolChange(tool.id),
    })),
  ]
}

function getCanvasCommandPaletteComponentItems({
  components,
  onInsertComponent,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'components' | 'onInsertComponent'
>): CanvasCommandPaletteItem[] {
  return components.map((component) => ({
    id: `component:${component.id}`,
    section: 'Create',
    title: `Add ${component.title}`,
    onSelect: () => onInsertComponent(component.id),
  }))
}

function getCanvasCommandPaletteCommandItems({
  commandAvailability,
  commandHandlers,
  config,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'commandAvailability' | 'commandHandlers' | 'config'
>): CanvasCommandPaletteItem[] {
  return CANVAS_TOOLBAR_COMMAND_GROUPS.flatMap((group) =>
    group.commands.flatMap((descriptor) => {
      if (!config.commands[descriptor.command]) {
        return []
      }

      const disabled = !commandAvailability[descriptor.command]

      return [{
        disabled,
        id: `command:${descriptor.command}`,
        section: 'Commands',
        shortcut: getCanvasAppCommandMappingShortcut({
          config,
          mapping: getCanvasAppCommandMapping(`command:${descriptor.command}`),
        }),
        title: CANVAS_COMMAND_AFFORDANCES[descriptor.command].title,
        onSelect: () =>
          runCanvasToolbarCommandAction({
            action: descriptor.action,
            handlers: commandHandlers,
          }),
      }]
    }),
  )
}

function getCanvasCommandPaletteCustomCommandItems({
  customCommands,
  onCustomCommand,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'customCommands' | 'onCustomCommand'
>): CanvasCommandPaletteItem[] {
  return customCommands.map((command) => ({
    disabled: command.disabled,
    id: `custom-command:${command.id}`,
    section: 'Commands',
    title: command.title,
    onSelect: () => onCustomCommand(command.id),
  }))
}

function getCanvasCommandPaletteViewportItems({
  config,
  onFitItems,
  onViewportReset,
  onZoom,
  selection,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'config' | 'onFitItems' | 'onViewportReset' | 'onZoom' | 'selection'
>): CanvasCommandPaletteItem[] {
  const items: CanvasCommandPaletteItem[] = []

  if (config.commands.fitView) {
    items.push({
      id: 'viewport:fit',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:fit'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.fitView.title,
      onSelect: () =>
        onFitItems(selection.length > 0 ? [...selection] : undefined),
    })
  }

  if (config.commands.zoomReset) {
    items.push({
      id: 'viewport:reset-zoom',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:reset-zoom'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.zoomReset.title,
      onSelect: onViewportReset,
    })
  }

  if (config.commands.zoomIn) {
    items.push({
      id: 'viewport:zoom-in',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:zoom-in'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.zoomIn.title,
      onSelect: () => onZoom('in'),
    })
  }

  if (config.commands.zoomOut) {
    items.push({
      id: 'viewport:zoom-out',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:zoom-out'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.zoomOut.title,
      onSelect: () => onZoom('out'),
    })
  }

  return items
}

function formatCanvasCommandPaletteShortcut(
  shortcut: CanvasAppCustomCreationToolState['shortcut'],
) {
  if (!shortcut) {
    return undefined
  }

  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key

  return shortcut.shiftKey ? `Shift+${key}` : key
}

function getCanvasCommandPaletteTitle(title: string) {
  return title.replace(/\s+\(.+\)$/, '')
}

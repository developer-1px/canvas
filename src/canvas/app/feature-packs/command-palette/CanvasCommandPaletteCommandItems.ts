import {
  CANVAS_COMMAND_AFFORDANCES,
} from '../../../engine'
import {
  getCanvasAppCommandMapping,
  getCanvasAppCommandMappingShortcut,
} from '../../affordances/commands/CanvasAppCommandRegistry'
import {
  CANVAS_TOOLBAR_COMMAND_GROUPS,
} from '../toolbar/CanvasToolbarCommandCatalog'
import {
  runCanvasToolbarCommandAction,
} from '../toolbar/CanvasToolbarCommandDispatch'
import type {
  CanvasCommandPaletteItem,
  CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'

export function getCanvasCommandPaletteCommandItems({
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

export function getCanvasCommandPaletteCustomCommandItems({
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

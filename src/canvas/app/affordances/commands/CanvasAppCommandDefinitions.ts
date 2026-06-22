import {
  defineInteractionCommandDefinitions,
} from '@interactive-os/interaction/runtime'
import {
  CANVAS_APP_EDITING_COMMAND_DEFINITIONS,
} from './CanvasAppEditingCommandDefinitions'
import {
  CANVAS_APP_SYSTEM_COMMAND_DEFINITIONS,
} from './CanvasAppSystemCommandDefinitions'
import {
  CANVAS_APP_VIEWPORT_COMMAND_DEFINITIONS,
} from './CanvasAppViewportCommandDefinitions'

export type {
  CanvasAppCommandBindingDefinition,
  CanvasAppCommandDefinition,
  CanvasAppCommandDefinitionSection,
  CanvasAppCommandShortcutDefinition,
} from './CanvasAppCommandDefinitionContracts'

export const CANVAS_APP_COMMAND_DEFINITIONS = Object.freeze(
  defineInteractionCommandDefinitions([
    ...CANVAS_APP_EDITING_COMMAND_DEFINITIONS,
    ...CANVAS_APP_VIEWPORT_COMMAND_DEFINITIONS,
    ...CANVAS_APP_SYSTEM_COMMAND_DEFINITIONS,
  ]),
)

import type {
  Bounds,
  CanvasJsonObject,
} from '../../../entities'
import type { CanvasAppCustomCommand } from '../../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../../editing/inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemRendererStrategy,
} from '../../rendering/CanvasAppRenderingContracts'
import {
  type CanvasAppCustomCreationToolContext,
  type CanvasAppCustomToolShortcut,
} from '../custom-tools/CanvasAppCustomCreationTools'
import {
  assertCanvasAppCustomItemModule,
} from './CanvasAppCustomItemModuleContracts'
import type {
  CanvasAppCustomItemValidator,
} from './CanvasAppCustomItemValidatorContracts'
import {
  snapshotCanvasAppCustomItemModule,
} from './CanvasAppCustomItemModuleSnapshot'

export type CanvasAppCustomItemModuleCreationItem = Bounds & {
  data: CanvasJsonObject
  locked?: boolean
  title: string
}

export type CanvasAppCustomItemModuleCreationTool = {
  ariaLabel?: string
  createItem: (
    context: CanvasAppCustomCreationToolContext,
  ) => CanvasAppCustomItemModuleCreationItem | null
  id: string
  label: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
  title: string
}

export type CanvasAppCustomItemModule = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomItemModuleCreationTool[]
  id: string
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  presentation: string
  renderItem: CanvasAppCustomItemRendererStrategy
  validateItem: CanvasAppCustomItemValidator
}

export function defineCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomItemModule(module)

  return snapshotCanvasAppCustomItemModule(module)
}

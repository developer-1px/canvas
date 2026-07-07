import type {
  Bounds,
  CanvasJsonObject,
} from '../../../entities'
import type { CanvasAppCustomCommand } from '../custom-commands'
import type { CanvasAppInspectorPanel } from '../inspector-panels'
import type {
  CanvasAppCustomItemRenderKeyStrategy,
  CanvasAppCustomItemRendererStrategy,
} from '../../rendering/CanvasAppRenderingContracts'
import type {
  CanvasTextPasteImporter,
} from '../../feature-packs/text-paste-import'
import type {
  CanvasMediaImporter,
} from '../../feature-packs/media-import'
import {
  type CanvasAppCustomCreationToolContext,
  type CanvasAppCustomToolShortcut,
} from '../custom-tools/CanvasAppCustomCreationTools'
import {
  assertCanvasAppCustomItemModule,
} from './CanvasAppCustomItemModuleContracts'
import type {
  CanvasAppCustomItemTextTarget,
} from './CanvasAppCustomItemTextTargetContracts'
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
  enterTextEdit?: boolean
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
  mediaImporters?: readonly CanvasMediaImporter[]
  presentation: string
  getRenderKey?: CanvasAppCustomItemRenderKeyStrategy
  renderItem: CanvasAppCustomItemRendererStrategy
  textPasteImporters?: readonly CanvasTextPasteImporter[]
  textTarget?: CanvasAppCustomItemTextTarget
  validateItem: CanvasAppCustomItemValidator
}

export function defineCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomItemModule(module)

  return snapshotCanvasAppCustomItemModule(module)
}

import type {
  CanvasAffordanceConfig,
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import type {
  CanvasAppComponentLibrary,
  CanvasAppComponentTemplate,
} from './CanvasAppComponentAssemblyContracts'
import type {
  CanvasAppCustomCommand,
} from '../affordances/commands/CanvasAppCustomCommands'
import type { CanvasWorkspaceStorageProvider } from '../workspace/document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemValidators,
} from '../extensions/custom-item-modules/CanvasAppCustomItemValidatorContracts'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppInspectorPanel } from '../affordances/editing/inspector/CanvasAppInspectorPanels'
import type { CanvasAppCustomCreationTool } from '../extensions/custom-tools/CanvasAppCustomCreationTools'
import type { CanvasMediaImporter } from '../affordances/io/media/CanvasMediaImporters'
import type { CanvasTextPasteImporter } from '../affordances/io/text-paste/CanvasTextPasteImporters'
import type { CanvasAppPresenceProvider } from './CanvasAppCollaborationAssembly'

export type CanvasAppAssemblyAffordanceModel = {
  config: CanvasAffordanceConfig
}

export type CanvasAppAssemblyCommandModel = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
}

export type CanvasAppAssemblyComponentModel = {
  componentLibrary: CanvasAppComponentLibrary
  creationAdapter: CanvasCreationAdapter<CanvasItem>
}

export type CanvasAppAssemblyControlModel = {
  components: readonly CanvasAppComponentTemplate[]
}

export type CanvasAppAssemblyCollaborationModel = {
  presenceProvider: CanvasAppPresenceProvider
}

export type CanvasAppAssemblyExtensionModel = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  mediaImporters: readonly CanvasMediaImporter[]
  textPasteImporters: readonly CanvasTextPasteImporter[]
}

export type CanvasAppAssemblyInspectorModel = {
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppAssemblyPointerItemAdapters = {
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppAssemblyPointerModel = {
  componentLibrary: CanvasAppComponentLibrary
  itemAdapters: CanvasAppAssemblyPointerItemAdapters
}

export type CanvasAppAssemblyRenderingModel = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: CanvasAppComponentLibrary['getPresentation']
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export type CanvasAppAssemblyWorkspaceModel = {
  customItemValidators: CanvasAppCustomItemValidators
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  storageProvider: CanvasWorkspaceStorageProvider
}

export type CanvasAppAssemblyModel = {
  affordance: CanvasAppAssemblyAffordanceModel
  command: CanvasAppAssemblyCommandModel
  collaboration: CanvasAppAssemblyCollaborationModel
  component: CanvasAppAssemblyComponentModel
  control: CanvasAppAssemblyControlModel
  extension: CanvasAppAssemblyExtensionModel
  inspector: CanvasAppAssemblyInspectorModel
  pointer: CanvasAppAssemblyPointerModel
  rendering: CanvasAppAssemblyRenderingModel
  workspace: CanvasAppAssemblyWorkspaceModel
}

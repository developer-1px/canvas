import type {
  CanvasAffordanceConfig,
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import type {
  CanvasComponentLibrary,
  CanvasComponentTemplate,
} from '../../host'
import type {
  CanvasAppCustomCommand,
} from '../commands/CanvasAppCustomCommands'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemValidators,
} from '../modules/CanvasAppCustomItemValidatorContracts'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppAssemblyAffordanceModel = {
  config: CanvasAffordanceConfig
}

export type CanvasAppAssemblyCommandModel = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
}

export type CanvasAppAssemblyComponentModel = {
  componentLibrary: CanvasComponentLibrary
}

export type CanvasAppAssemblyControlModel = {
  components: readonly CanvasComponentTemplate[]
}

export type CanvasAppAssemblyExtensionModel = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
}

export type CanvasAppAssemblyInspectorModel = {
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppAssemblyPointerItemAdapters = {
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppAssemblyPointerModel = {
  itemAdapters: CanvasAppAssemblyPointerItemAdapters
}

export type CanvasAppAssemblyRenderingModel = {
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customItemRenderers: CanvasAppCustomItemRenderers
  getComponentPresentation: CanvasComponentLibrary['getPresentation']
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
  component: CanvasAppAssemblyComponentModel
  control: CanvasAppAssemblyControlModel
  extension: CanvasAppAssemblyExtensionModel
  inspector: CanvasAppAssemblyInspectorModel
  pointer: CanvasAppAssemblyPointerModel
  rendering: CanvasAppAssemblyRenderingModel
  workspace: CanvasAppAssemblyWorkspaceModel
}

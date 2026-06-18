import type {
  CanvasAffordanceConfig,
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import type {
  CanvasAppComponentDefinitionRegistry,
  CanvasAppComponentLibrary,
  CanvasAppComponentTemplate,
} from './CanvasAppComponentAssemblyContracts'
import type {
  CanvasComponentSetSummary,
} from '../../host'
import type {
  CanvasAppCustomCommand,
} from '../extensions/custom-commands'
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
import type { CanvasAppInspectorPanel } from '../extensions/inspector-panels'
import type {
  CanvasAppItemsChangeTransformer,
} from '../extensions/items-change-transformers'
import type { CanvasAppCustomCreationTool } from '../extensions/custom-tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackViewRenderers,
  CanvasMediaImporter,
  CanvasTextPasteImporter,
} from '../feature-packs'
import type { CanvasAppCapabilitySnapshot } from './CanvasAppCapabilityAssembly'
import type { CanvasAppPresenceProvider } from './CanvasAppCollaborationAssembly'

export type CanvasAppAssemblyAffordanceModel = {
  config: CanvasAffordanceConfig
}

export type CanvasAppAssemblyCommandModel = {
  capabilities: CanvasAppCapabilitySnapshot
  commandAdapter: CanvasCommandAdapter<CanvasItem>
}

export type CanvasAppAssemblyComponentModel = {
  componentDefinitionRegistry: CanvasAppComponentDefinitionRegistry
  componentLibrary: CanvasAppComponentLibrary
  creationAdapter: CanvasCreationAdapter<CanvasItem>
}

export type CanvasAppAssemblyControlModel = {
  componentSets: readonly CanvasComponentSetSummary[]
  components: readonly CanvasAppComponentTemplate[]
}

export type CanvasAppAssemblyCollaborationModel = {
  presenceProvider: CanvasAppPresenceProvider
}

export type CanvasAppAssemblyExtensionModel = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  itemsChangeTransformers: readonly CanvasAppItemsChangeTransformer[]
  mediaImporters: readonly CanvasMediaImporter[]
  textPasteImporters: readonly CanvasTextPasteImporter[]
}

export type CanvasAppAssemblyFeaturePackModel = {
  enabledIds: readonly CanvasAppFeaturePackId[]
  installedIds: readonly CanvasAppFeaturePackId[]
  viewRenderers: CanvasAppFeaturePackViewRenderers
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
  componentDefinitionRegistry: CanvasAppComponentDefinitionRegistry
  customItemValidators: CanvasAppCustomItemValidators
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  itemsChangeTransformers: readonly CanvasAppItemsChangeTransformer[]
  storageProvider: CanvasWorkspaceStorageProvider
}

export type CanvasAppAssemblyModel = {
  affordance: CanvasAppAssemblyAffordanceModel
  command: CanvasAppAssemblyCommandModel
  collaboration: CanvasAppAssemblyCollaborationModel
  component: CanvasAppAssemblyComponentModel
  control: CanvasAppAssemblyControlModel
  extension: CanvasAppAssemblyExtensionModel
  featurePack: CanvasAppAssemblyFeaturePackModel
  inspector: CanvasAppAssemblyInspectorModel
  pointer: CanvasAppAssemblyPointerModel
  rendering: CanvasAppAssemblyRenderingModel
  workspace: CanvasAppAssemblyWorkspaceModel
}

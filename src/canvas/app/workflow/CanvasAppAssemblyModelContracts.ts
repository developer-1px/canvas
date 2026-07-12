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
} from '../extensions/custom-commands'
import type { CanvasWorkspaceStorageProvider } from '../workspace/document/CanvasWorkspacePersistence'
import type {
  CanvasAppCustomItemTextTargets,
} from '../extensions/custom-item-modules/CanvasAppCustomItemTextTargetContracts'
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
import type { CanvasAppCustomCreationTool } from '../extensions/custom-tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackViewRenderers,
  CanvasMediaImporter,
  CanvasTextPasteImporter,
} from '../feature-packs'
import type { CanvasAppPresenceProvider } from './CanvasAppCollaborationAssembly'
import type { CanvasAppDocumentAuthorityRead } from '../workspace/document/CanvasAppDocumentContracts'
import type {
  CanvasAppFoundationExtensionRuntime,
} from '../extensions/foundation-extensions'

export type CanvasAppAssemblyAffordanceModel = {
  config: CanvasAffordanceConfig
}

export type CanvasAppAssemblyCommandModel = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
}

export type CanvasAppAssemblyComponentModel = {
  componentLibrary: CanvasAppComponentLibrary
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  foundationExtensionRuntime: CanvasAppFoundationExtensionRuntime
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

export type CanvasAppAssemblyFeaturePackModel = {
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
  foundationExtensionRuntime: CanvasAppFoundationExtensionRuntime
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
  customItemTextTargets: CanvasAppCustomItemTextTargets
  customItemValidators: CanvasAppCustomItemValidators
  documentAuthority: CanvasAppDocumentAuthorityRead
  foundationExtensionRuntime: CanvasAppFoundationExtensionRuntime
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
  featurePack: CanvasAppAssemblyFeaturePackModel
  inspector: CanvasAppAssemblyInspectorModel
  pointer: CanvasAppAssemblyPointerModel
  rendering: CanvasAppAssemblyRenderingModel
  workspace: CanvasAppAssemblyWorkspaceModel
}

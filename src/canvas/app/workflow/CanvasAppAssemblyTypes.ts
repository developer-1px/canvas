import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from '../../engine'
import type {
  CanvasComponentLibrary,
  CanvasCustomItemValidators,
  CanvasItem,
} from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type { CanvasAppItemLayerAdapter } from '../rendering/CanvasAppItemLayerAdapter'
import type { CanvasAppStageAdapter } from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'

export type CanvasAppAssembly = {
  affordanceConfig: CanvasAffordanceConfig
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasAppCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  itemAdapters: CanvasAppItemAdapters
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
  workspaceStorageProvider: CanvasWorkspaceStorageProvider
}

export type CanvasAppAssemblyInput = {
  affordanceConfig?: CanvasAffordanceConfigInput
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  initialItems?: CanvasItem[]
  initialSelection?: readonly string[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  itemAdapters?: CanvasAppItemAdapters
  itemLayerAdapter?: CanvasAppItemLayerAdapter
  stageAdapter?: CanvasAppStageAdapter
  workspaceStorageProvider?: CanvasWorkspaceStorageProvider
}

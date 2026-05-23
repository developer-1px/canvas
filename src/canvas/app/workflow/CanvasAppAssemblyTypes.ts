import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from '../../engine'
import type {
  CanvasComponentLibrary,
  CanvasItem,
} from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import type { CanvasAppExtensionBundle } from '../extensions/CanvasAppExtensionBundle'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import type {
  CanvasAppComponentPresentationRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type { CanvasAppItemLayerAdapter } from '../rendering/CanvasAppItemLayerAdapter'
import type { CanvasAppStageAdapter } from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'

export type CanvasAppAssembly = CanvasAppExtensionBundle & {
  affordanceConfig: CanvasAffordanceConfig
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
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

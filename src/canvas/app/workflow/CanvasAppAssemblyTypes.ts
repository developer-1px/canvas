import type {
  CanvasAffordanceConfig,
} from '../../engine'
import type {
  CanvasComponentLibrary,
  CanvasItem,
} from '../../host'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import type { CanvasAppExtensionBundle } from '../extensions/CanvasAppExtensionBundle'
import type {
  CanvasAppComponentPresentationRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type { CanvasAppItemLayerAdapter } from '../rendering/CanvasAppItemLayerAdapter'
import type { CanvasAppStageAdapter } from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'
import type {
  CanvasAppAdapterAssemblyInput,
  CanvasAppAffordanceAssemblyInput,
  CanvasAppComponentAssemblyInput,
  CanvasAppWorkspaceAssemblyInput,
} from './CanvasAppAssemblyInputTypes'
import type { CanvasAppExtensionAssemblyInput } from './CanvasAppExtensionAssemblyTypes'

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

export type CanvasAppAssemblyInput =
  CanvasAppExtensionAssemblyInput &
  CanvasAppAffordanceAssemblyInput &
  CanvasAppComponentAssemblyInput &
  CanvasAppAdapterAssemblyInput &
  CanvasAppWorkspaceAssemblyInput

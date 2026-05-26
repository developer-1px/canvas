import type {
  CanvasAffordanceConfig,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import type { CanvasWorkspaceStorageProvider } from '../workspace/document/CanvasWorkspacePersistence'
import type { CanvasAppExtensionBundle } from '../extensions/CanvasAppExtensionBundle'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppComponentLibrary } from './CanvasAppComponentAssemblyContracts'
import type {
  CanvasAppAdapterAssemblyInput,
  CanvasAppAffordanceAssemblyInput,
  CanvasAppComponentAssemblyInput,
  CanvasAppWorkspaceAssemblyInput,
} from './CanvasAppAssemblyInputTypes'
import type { CanvasAppExtensionAssemblyInput } from './CanvasAppExtensionAssemblyTypes'

export type CanvasAppAssembly = CanvasAppExtensionBundle & {
  affordanceConfig: CanvasAffordanceConfig
  componentLibrary: CanvasAppComponentLibrary
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

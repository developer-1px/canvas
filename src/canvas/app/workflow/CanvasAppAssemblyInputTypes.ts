import type {
  CanvasAffordanceConfigInput,
} from '../../engine'
import type {
  CanvasComponentLibrary,
  CanvasItem,
} from '../../host'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'

export type CanvasAppAffordanceAssemblyInput = {
  affordanceConfig?: CanvasAffordanceConfigInput
}

export type CanvasAppComponentAssemblyInput = {
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
}

export type CanvasAppAdapterAssemblyInput = {
  itemAdapters?: CanvasAppItemAdapters
  itemLayerAdapter?: CanvasAppItemLayerAdapter
  stageAdapter?: CanvasAppStageAdapter
}

export type CanvasAppWorkspaceAssemblyInput = {
  initialItems?: CanvasItem[]
  initialSelection?: readonly string[]
  workspaceStorageProvider?: CanvasWorkspaceStorageProvider
}

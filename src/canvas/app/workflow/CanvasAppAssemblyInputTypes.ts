import type {
  CanvasAffordanceConfigInput,
} from '../../engine'
import type { CanvasItem } from '../../entities'
import type { CanvasWorkspaceStorageProvider } from '../workspace/document/CanvasWorkspacePersistence'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'
import type { CanvasAppComponentLibrary } from './CanvasAppComponentAssemblyContracts'

export type CanvasAppAffordanceAssemblyInput = {
  affordanceConfig?: CanvasAffordanceConfigInput
}

export type CanvasAppComponentAssemblyInput = {
  componentLibrary?: CanvasAppComponentLibrary
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

import type {
  CanvasAppAssemblyAdapters,
  CanvasAppItemAdapters,
} from './CanvasAppAdapterContracts'
import type { CanvasAppItemLayerAdapter } from '../rendering/CanvasAppItemLayerAdapter'
import type { CanvasAppStageAdapter } from '../rendering/CanvasAppStageAdapter'

export type CanvasAppAdapterAssemblyInput = {
  itemAdapters?: CanvasAppItemAdapters
  itemLayerAdapter?: CanvasAppItemLayerAdapter
  stageAdapter?: CanvasAppStageAdapter
}

export function createCanvasAppAdapterAssembly(
  input: CanvasAppAdapterAssemblyInput,
  defaults: CanvasAppAssemblyAdapters,
): CanvasAppAssemblyAdapters {
  return {
    itemAdapters: input.itemAdapters ?? defaults.itemAdapters,
    itemLayerAdapter: input.itemLayerAdapter ?? defaults.itemLayerAdapter,
    stageAdapter: input.stageAdapter ?? defaults.stageAdapter,
  }
}

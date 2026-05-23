import type {
  CanvasAppAssemblyAdapters,
} from './CanvasAppAdapterContracts'
import type { CanvasAppAdapterAssemblyInput } from './CanvasAppAssemblyInputTypes'

export type { CanvasAppAdapterAssemblyInput } from './CanvasAppAssemblyInputTypes'

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

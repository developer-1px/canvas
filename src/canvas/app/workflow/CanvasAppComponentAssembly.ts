import {
  createCanvasAppComponentPresentationRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import type { CanvasAppComponentAssemblyInput } from './CanvasAppAssemblyInputTypes'
import type { CanvasAppComponentAssemblyContract } from './CanvasAppComponentAssemblyContracts'

export type { CanvasAppComponentAssemblyInput } from './CanvasAppAssemblyInputTypes'

export function createCanvasAppComponentAssembly(
  input: CanvasAppComponentAssemblyInput,
  defaults: CanvasAppComponentAssemblyContract,
): CanvasAppComponentAssemblyContract {
  return {
    componentLibrary: input.componentLibrary ?? defaults.componentLibrary,
    componentPresentationRenderers: createCanvasAppComponentPresentationRenderers(
      input.componentPresentationRenderers,
    ),
  }
}

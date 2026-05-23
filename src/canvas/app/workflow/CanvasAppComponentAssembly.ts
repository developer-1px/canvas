import type { CanvasComponentLibrary } from '../../host'
import {
  createCanvasAppComponentPresentationRenderers,
  type CanvasAppComponentPresentationRenderers,
} from '../rendering'
import type { CanvasAppComponentAssemblyContract } from './CanvasAppComponentAssemblyContracts'

export type CanvasAppComponentAssemblyInput = {
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
}

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

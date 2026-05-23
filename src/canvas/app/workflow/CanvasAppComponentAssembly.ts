import type { CanvasComponentLibrary } from '../../host'
import {
  createCanvasAppComponentPresentationRenderers,
  type CanvasAppComponentPresentationRenderers,
} from '../rendering'
import type { CanvasAppAssembly } from './CanvasAppAssembly'

export type CanvasAppComponentAssemblyInput = {
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
}

type CanvasAppComponentAssembly = Pick<
  CanvasAppAssembly,
  'componentLibrary' | 'componentPresentationRenderers'
>

export function createCanvasAppComponentAssembly(
  input: CanvasAppComponentAssemblyInput,
  defaults: CanvasAppComponentAssembly,
): CanvasAppComponentAssembly {
  return {
    componentLibrary: input.componentLibrary ?? defaults.componentLibrary,
    componentPresentationRenderers: createCanvasAppComponentPresentationRenderers(
      input.componentPresentationRenderers,
    ),
  }
}

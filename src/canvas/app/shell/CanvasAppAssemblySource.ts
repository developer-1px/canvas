import {
  createCanvasAppAssembly,
  type CanvasAppAssembly,
  type CanvasAppAssemblyInput,
} from '../workflow'

export type CanvasAppAssemblySource =
  | {
      assembly?: CanvasAppAssembly
      assemblyInput?: undefined
    }
  | {
      assembly?: undefined
      assemblyInput?: CanvasAppAssemblyInput
    }

type CanvasAppAssemblySourceValue = {
  assembly?: CanvasAppAssembly
  assemblyInput?: CanvasAppAssemblyInput
}

export function resolveCanvasAppAssemblySource({
  assembly,
  assemblyInput,
}: CanvasAppAssemblySourceValue = {}) {
  if (assembly && assemblyInput) {
    throw new Error(
      'CanvasApp accepts either assembly or assemblyInput, not both',
    )
  }

  return assembly ?? createCanvasAppAssembly(assemblyInput)
}

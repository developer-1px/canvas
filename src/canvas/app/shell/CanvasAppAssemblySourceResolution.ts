import { createCanvasAppAssembly } from '../workflow'
import type { CanvasAppAssemblySourceValue } from './CanvasAppAssemblySourceContracts'

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

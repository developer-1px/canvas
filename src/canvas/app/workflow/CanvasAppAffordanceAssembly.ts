import {
  createCanvasAffordanceConfig,
  type CanvasAffordanceConfig,
} from '../../engine'
import type { CanvasAppAffordanceAssemblyInput } from './CanvasAppAssemblyInputTypes'

export type { CanvasAppAffordanceAssemblyInput } from './CanvasAppAssemblyInputTypes'

export type CanvasAppAffordanceAssembly = {
  affordanceConfig: CanvasAffordanceConfig
}

export function createCanvasAppAffordanceAssembly(
  input: CanvasAppAffordanceAssemblyInput,
  defaults: CanvasAppAffordanceAssembly,
): CanvasAppAffordanceAssembly {
  return {
    affordanceConfig: input.affordanceConfig === undefined
      ? defaults.affordanceConfig
      : createCanvasAffordanceConfig(input.affordanceConfig),
  }
}

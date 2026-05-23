import {
  createCanvasAffordanceConfig,
  type CanvasAffordanceConfig,
  type CanvasAffordanceConfigInput,
} from '../../engine'

export type CanvasAppAffordanceAssembly = {
  affordanceConfig: CanvasAffordanceConfig
}

export type CanvasAppAffordanceAssemblyInput = {
  affordanceConfig?: CanvasAffordanceConfigInput
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

import type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from '../workflow'

export type CanvasAppAssemblySource =
  | CanvasAppPrebuiltAssemblySource
  | CanvasAppAssemblyInputSource

export type CanvasAppPrebuiltAssemblySource = {
  assembly?: CanvasAppAssembly
  assemblyInput?: undefined
}

export type CanvasAppAssemblyInputSource = {
  assembly?: undefined
  assemblyInput?: CanvasAppAssemblyInput
}

export type CanvasAppAssemblyRequiredInputSource = {
  assembly?: undefined
  assemblyInput: CanvasAppAssemblyInput
}

export type CanvasAppAssemblySourceValue = {
  assembly?: CanvasAppAssembly
  assemblyInput?: CanvasAppAssemblyInput
}

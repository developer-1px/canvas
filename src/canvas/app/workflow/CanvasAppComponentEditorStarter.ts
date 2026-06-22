import {
  CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE,
} from '../feature-packs'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  createCanvasAppAssembly,
} from './CanvasAppAssembly'
import type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'

export type CanvasAppComponentEditorStarterInput = Omit<
  CanvasAppAssemblyInput,
  'capabilities' | 'featurePackProfile' | 'featurePackProfileId'
>

export const CANVAS_APP_COMPONENT_EDITOR_STARTER_PROFILE_ID =
  CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE.id

export function createCanvasAppComponentEditorAssemblyInput(
  input: CanvasAppComponentEditorStarterInput = {},
): CanvasAppAssemblyInput {
  return Object.freeze({
    ...input,
    capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
    featurePackProfile: CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE,
  })
}

export function createCanvasAppComponentEditorAssembly(
  input: CanvasAppComponentEditorStarterInput = {},
): CanvasAppAssembly {
  return createCanvasAppAssembly(
    createCanvasAppComponentEditorAssemblyInput(input),
  )
}

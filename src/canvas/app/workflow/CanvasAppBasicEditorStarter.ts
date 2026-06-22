import {
  CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE,
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

export type CanvasAppBasicEditorStarterInput = Omit<
  CanvasAppAssemblyInput,
  'capabilities' | 'featurePackProfile' | 'featurePackProfileId'
>

export const CANVAS_APP_BASIC_EDITOR_STARTER_PROFILE_ID =
  CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE.id

export function createCanvasAppBasicEditorAssemblyInput(
  input: CanvasAppBasicEditorStarterInput = {},
): CanvasAppAssemblyInput {
  return Object.freeze({
    ...input,
    capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
    featurePackProfile: CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE,
  })
}

export function createCanvasAppBasicEditorAssembly(
  input: CanvasAppBasicEditorStarterInput = {},
): CanvasAppAssembly {
  return createCanvasAppAssembly(
    createCanvasAppBasicEditorAssemblyInput(input),
  )
}

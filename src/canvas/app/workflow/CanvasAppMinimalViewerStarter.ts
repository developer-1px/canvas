import {
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
} from '../feature-packs'
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  createCanvasAppAssembly,
} from './CanvasAppAssembly'
import type {
  CanvasAppAssembly,
  CanvasAppAssemblyInput,
} from './CanvasAppAssemblyTypes'

export type CanvasAppMinimalViewerStarterInput = Omit<
  CanvasAppAssemblyInput,
  'capabilities' | 'featurePackProfile' | 'featurePackProfileId'
>

export const CANVAS_APP_MINIMAL_VIEWER_STARTER_PROFILE_ID =
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE.id

export function createCanvasAppMinimalViewerAssemblyInput(
  input: CanvasAppMinimalViewerStarterInput = {},
): CanvasAppAssemblyInput {
  return Object.freeze({
    ...input,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
    featurePackProfile: CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
  })
}

export function createCanvasAppMinimalViewerAssembly(
  input: CanvasAppMinimalViewerStarterInput = {},
): CanvasAppAssembly {
  return createCanvasAppAssembly(
    createCanvasAppMinimalViewerAssemblyInput(input),
  )
}

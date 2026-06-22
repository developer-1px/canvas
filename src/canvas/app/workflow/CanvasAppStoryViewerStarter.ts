import {
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  type CanvasStoryCanvasFeaturePackManifestsInput,
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
import {
  createCanvasStoryCanvasFeaturePackAssemblyInput,
} from './CanvasAppStoryCanvasAssembly'

export type CanvasAppStoryViewerStarterInput =
  CanvasStoryCanvasFeaturePackManifestsInput &
  Omit<
    CanvasAppAssemblyInput,
    'capabilities' | 'featurePackProfile' | 'featurePackProfileId'
  >

export const CANVAS_APP_STORY_VIEWER_STARTER_PROFILE_ID =
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE.id

export function createCanvasAppStoryViewerAssemblyInput({
  renderGroupItem,
  renderPreviewItem,
  ...input
}: CanvasAppStoryViewerStarterInput): CanvasAppAssemblyInput {
  const storyCanvasAssemblyInput = createCanvasStoryCanvasFeaturePackAssemblyInput({
    assemblyInput: input,
    renderGroupItem,
    renderPreviewItem,
  })

  return Object.freeze({
    ...input,
    ...storyCanvasAssemblyInput,
    capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
    featurePackProfile: CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  })
}

export function createCanvasAppStoryViewerAssembly(
  input: CanvasAppStoryViewerStarterInput,
): CanvasAppAssembly {
  return createCanvasAppAssembly(
    createCanvasAppStoryViewerAssemblyInput(input),
  )
}

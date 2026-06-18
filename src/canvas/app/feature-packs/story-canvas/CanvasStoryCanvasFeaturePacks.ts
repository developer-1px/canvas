import {
  type CanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
} from '../story-import/CanvasStoryImportFeaturePack'
import {
  createCanvasStoryPreviewItemsFeaturePackManifest,
  type CanvasStoryPreviewItemsFeaturePackInput,
} from '../story-preview'

export type CanvasStoryCanvasFeaturePackManifestsInput =
  CanvasStoryPreviewItemsFeaturePackInput

export function createCanvasStoryCanvasFeaturePackManifests(
  input: CanvasStoryCanvasFeaturePackManifestsInput,
): readonly CanvasAppFeaturePackManifest[] {
  return Object.freeze([
    createCanvasStoryPreviewItemsFeaturePackManifest(input),
    CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
  ])
}

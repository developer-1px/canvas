import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export {
  createCanvasStoryImportItems,
  type CanvasStoryImportGroup,
  type CanvasStoryImportInput,
  type CanvasStoryImportStory,
} from './CanvasStoryImport'

export const CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'import-export',
    contributes: {
      surfaces: ['importer', 'item-schema'],
    },
    id: 'story-import',
    label: 'Story import',
    lifecycle: {
      partialUpdate: ['importer', 'item-schema'],
      runtimeToggleable: true,
    },
    runtimeFeaturePacks: {
      storyImport: true,
    },
    requires: ['story-preview-items'],
  })

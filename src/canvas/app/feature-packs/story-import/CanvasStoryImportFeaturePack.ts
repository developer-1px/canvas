import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'

export const CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'import-export',
    contributes: {
      surfaces: ['importer', 'item-schema'],
    },
    id: 'story-import',
    label: 'Story import',
    lifecycle: {
      orphanedDataPolicy: 'preserve',
      partialUpdate: ['importer', 'item-schema'],
      runtimeToggleable: true,
    },
    runtimeFeaturePacks: {
      storyImport: true,
    },
    requires: ['story-preview-items'],
  })

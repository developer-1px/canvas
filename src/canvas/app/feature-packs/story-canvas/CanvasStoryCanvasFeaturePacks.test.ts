import { describe, expect, it } from 'vitest'

import {
  CANVAS_STORY_CANVAS_SUITE_ID,
} from '../CanvasAppDefaultFeaturePackSuites'
import {
  getCanvasAppFeaturePackMarketplaceModel,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
} from '../CanvasAppFeaturePackMarketplace'
import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
} from '../story-import/CanvasStoryImportFeaturePack'
import {
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
} from '../story-preview'
import {
  createCanvasStoryCanvasFeaturePackManifests,
} from './CanvasStoryCanvasFeaturePacks'

describe('CanvasStoryCanvasFeaturePacks', () => {
  it('creates the manifest bundle required by the Story Canvas suite', () => {
    const manifests = createCanvasStoryCanvasFeaturePackManifests({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(manifests.map((manifest) => manifest.id)).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
    expect(Object.isFrozen(manifests)).toBe(true)

    const marketplaceModel = getCanvasAppFeaturePackMarketplaceModel({
      manifests,
      options: {
        featurePackStates: manifests.map((manifest) => ({
          id: manifest.id,
          status: 'uninstalled',
        })),
      },
    })
    const storyCanvasSuiteItem = marketplaceModel.suites.items.find((item) =>
      item.suiteId === CANVAS_STORY_CANVAS_SUITE_ID
    )

    if (!storyCanvasSuiteItem) {
      throw new Error('Expected Story Canvas suite marketplace item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(storyCanvasSuiteItem)

    expect(storyCanvasSuiteItem.status).toBe('uninstalled')
    expect(storyCanvasSuiteItem.primaryActionKind).toBe('install')
    expect(primaryAction.ready).toBe(true)
    expect(primaryAction.changedFeaturePackIds).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
  })
})

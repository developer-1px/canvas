import { describe, expect, it } from 'vitest'

import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
  CANVAS_STORY_CANVAS_SUITE_ID,
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
  createCanvasAppFeaturePackManifest,
  createCanvasStoryCanvasFeaturePackManifests,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult,
} from './CanvasAppFeaturePackAssembly'
import {
  createCanvasStoryCanvasFeaturePackAssemblyInput,
  getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppStoryCanvasAssembly'

describe('CanvasAppStoryCanvasAssembly', () => {
  it('merges Story Canvas feature pack manifests into host assembly input', () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const previousStoryCanvasManifests = createCanvasStoryCanvasFeaturePackManifests({
      renderGroupItem: ({ groupLabel }) => `previous group ${groupLabel}`,
      renderPreviewItem: ({ storyId }) => `previous story ${storyId}`,
    })
    const assemblyInput = createCanvasStoryCanvasFeaturePackAssemblyInput({
      assemblyInput: {
        additionalFeaturePackManifests: [
          addonManifest,
          ...previousStoryCanvasManifests,
        ],
        featurePackStates: [{
          id: 'addon-pack',
          status: 'enabled',
        }],
      },
      renderGroupItem: ({ groupLabel }) => `group ${groupLabel}`,
      renderPreviewItem: ({ storyId }) => `story ${storyId}`,
    })

    expect(assemblyInput.additionalFeaturePackManifests?.map((manifest) =>
      manifest.id
    )).toEqual([
      'addon-pack',
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
    expect(assemblyInput.additionalFeaturePackManifests?.[1])
      .not.toBe(previousStoryCanvasManifests[0])
    expect(assemblyInput.additionalFeaturePackManifests?.filter((manifest) =>
      manifest.id === CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id
    )).toHaveLength(1)
    expect(assemblyInput.featurePackStates).toEqual([{
      id: 'addon-pack',
      status: 'enabled',
    }])
    expect(Object.isFrozen(assemblyInput)).toBe(true)
    expect(Object.isFrozen(assemblyInput.additionalFeaturePackManifests))
      .toBe(true)
  })

  it('creates a marketplace assembly model where Story Canvas suite can install', () => {
    const model = getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackStates: [
          {
            id: CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
            status: 'uninstalled',
          },
          {
            id: CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
            status: 'uninstalled',
          },
        ],
      },
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })
    const storyCanvasSuiteItem = model.marketplaceModel.suites.items.find(
      (item) => item.suiteId === CANVAS_STORY_CANVAS_SUITE_ID,
    )

    if (!storyCanvasSuiteItem) {
      throw new Error('Expected Story Canvas suite marketplace item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(storyCanvasSuiteItem)
    const applyResult =
      getCanvasAppFeaturePackMarketplaceAssemblyItemApplyResult({
        item: storyCanvasSuiteItem,
        model,
      })

    expect(model.assemblyInput.additionalFeaturePackManifests?.map(
      (manifest) => manifest.id,
    )).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
    expect(storyCanvasSuiteItem).toMatchObject({
      missingFeaturePackIds: [],
      primaryActionKind: 'install',
      status: 'uninstalled',
    })
    expect(primaryAction).toMatchObject({
      changedFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ],
      kind: 'install',
      ready: true,
      status: 'ready',
    })
    expect(applyResult).toMatchObject({
      actionKind: 'install',
      status: 'ready',
    })
    if (applyResult.status !== 'ready') {
      throw new Error('Expected ready apply result')
    }

    expect(applyResult.nextModel.marketplaceModel.suites.items.find((item) =>
      item.suiteId === CANVAS_STORY_CANVAS_SUITE_ID
    )).toMatchObject({
      primaryActionKind: 'enable',
      status: 'disabled',
    })
  })
})

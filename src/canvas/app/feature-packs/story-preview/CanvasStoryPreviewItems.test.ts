import { describe, expect, it } from 'vitest'
import type { CanvasCustomItem } from '../../../entities'
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
  createCanvasStoryPreviewItemModules,
  createCanvasStoryPreviewItemsFeaturePack,
  createCanvasStoryPreviewItemsFeaturePackManifest,
  isCanvasStoryPreviewGroupItem,
  isCanvasStoryPreviewItem,
} from './CanvasStoryPreviewItems'

describe('CanvasStoryPreviewItems', () => {
  it('creates story preview custom item modules with scoped validators', () => {
    const modules = createCanvasStoryPreviewItemModules({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(modules.map((module) => module.id)).toEqual([
      CANVAS_STORY_PREVIEW_GROUP_KIND,
      CANVAS_STORY_PREVIEW_ITEM_KIND,
    ])
    expect(modules.map((module) => module.presentation)).toEqual([
      CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
      CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
    ])
    expect(modules[0].validateItem(createStoryGroupItem())).toBe(true)
    expect(modules[0].validateItem(createStoryPreviewItem())).toBe(false)
    expect(modules[1].validateItem(createStoryPreviewItem())).toBe(true)
    expect(modules[1].validateItem(createStoryGroupItem())).toBe(false)
  })

  it('exposes preview and group renderers through a feature pack bundle', () => {
    const featurePack = createCanvasStoryPreviewItemsFeaturePack({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(featurePack.id).toBe(CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID)
    expect(featurePack.extensionBundle.customItemRenderers)
      .toHaveProperty(CANVAS_STORY_PREVIEW_GROUP_PRESENTATION)
    expect(featurePack.extensionBundle.customItemRenderers)
      .toHaveProperty(CANVAS_STORY_PREVIEW_ITEM_PRESENTATION)
    expect(featurePack.extensionBundle.customItemValidators)
      .toHaveProperty(CANVAS_STORY_PREVIEW_GROUP_KIND)
    expect(featurePack.extensionBundle.customItemValidators)
      .toHaveProperty(CANVAS_STORY_PREVIEW_ITEM_KIND)
    expect(
      featurePack.extensionBundle.customItemValidators[
        CANVAS_STORY_PREVIEW_ITEM_KIND
      ]?.(createStoryPreviewItem()),
    ).toBe(true)
  })

  it('wraps preview item modules as an installable manifest', () => {
    const manifest = createCanvasStoryPreviewItemsFeaturePackManifest({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(manifest.id).toBe(CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID)
    expect(manifest.category).toBe('view')
    expect(manifest.contributes.surfaces).toEqual([
      'item-renderer',
      'item-schema',
    ])
    expect(manifest.lifecycle.runtimeToggleable).toBe(true)
    expect(manifest.extensionFeaturePack?.id).toBe(
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
    )
  })

  it('recognizes only story preview item data contracts', () => {
    expect(isCanvasStoryPreviewItem(createStoryPreviewItem())).toBe(true)
    expect(isCanvasStoryPreviewItem({
      ...createStoryPreviewItem(),
      data: {},
    })).toBe(false)
    expect(isCanvasStoryPreviewGroupItem(createStoryGroupItem())).toBe(true)
    expect(isCanvasStoryPreviewGroupItem({
      ...createStoryGroupItem(),
      data: {},
    })).toBe(false)
  })
})

function createStoryPreviewItem(): CanvasCustomItem {
  return {
    data: {
      storyId: 'hero-story',
    },
    h: 80,
    id: 'story-preview',
    kind: CANVAS_STORY_PREVIEW_ITEM_KIND,
    presentation: CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
    title: 'Hero story',
    type: 'custom',
    w: 120,
    x: 0,
    y: 0,
  }
}

function createStoryGroupItem(): CanvasCustomItem {
  return {
    data: {
      count: 2,
      groupLabel: 'Homepage',
    },
    h: 80,
    id: 'story-group',
    kind: CANVAS_STORY_PREVIEW_GROUP_KIND,
    presentation: CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
    title: 'Homepage',
    type: 'custom',
    w: 120,
    x: 0,
    y: 0,
  }
}

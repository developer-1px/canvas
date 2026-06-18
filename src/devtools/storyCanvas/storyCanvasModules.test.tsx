import { describe, expect, it } from 'vitest';
import {
  CANVAS_STORY_CANVAS_SUITE_ID,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
} from '../../canvas';
import {
  STORY_CANVAS_FEATURE_PACK_PROFILE,
  createStoryPreviewFeaturePackManifest,
  createStoryViewStore,
} from './storyCanvasModules';

describe('storyCanvasModules', () => {
  it('assembles story preview rendering as a feature pack manifest', () => {
    const manifest = createStoryPreviewFeaturePackManifest({
      onSelectElement: () => undefined,
      onSelectStory: () => undefined,
      onToggleFavorite: () => undefined,
      store: createStoryViewStore(),
      storyRecordById: new Map(),
    });

    expect(manifest.id).toBe(CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID);
    expect(manifest.extensionFeaturePack?.id).toBe(
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
    );
    expect(manifest.extensionFeaturePack?.extensionBundle.customItemRenderers)
      .toHaveProperty(CANVAS_STORY_PREVIEW_GROUP_PRESENTATION);
    expect(manifest.extensionFeaturePack?.extensionBundle.customItemRenderers)
      .toHaveProperty(CANVAS_STORY_PREVIEW_ITEM_PRESENTATION);
  });

  it('keeps story canvas profile scoped to the story suite and zoom controls', () => {
    expect(STORY_CANVAS_FEATURE_PACK_PROFILE.installedSuiteIds).toEqual([
      CANVAS_STORY_CANVAS_SUITE_ID,
    ]);
    expect(STORY_CANVAS_FEATURE_PACK_PROFILE.installedFeaturePackIds).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      'zoom-controls',
    ]);
    expect(STORY_CANVAS_FEATURE_PACK_PROFILE.enabledFeaturePackIds).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      'zoom-controls',
    ]);
  });
});

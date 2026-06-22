import { describe, expect, it } from 'vitest'

import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
} from '../feature-packs'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
} from '../feature-packs/CanvasAppDefaultViewFeaturePacks'
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  CANVAS_APP_STORY_VIEWER_STARTER_PROFILE_ID,
  createCanvasAppStoryViewerAssembly,
  createCanvasAppStoryViewerAssemblyInput,
} from './CanvasAppStoryViewerStarter'

describe('CanvasAppStoryViewerStarter', () => {
  it('creates a read-only story-viewer assembly input with Story Canvas manifests', () => {
    const input = createCanvasAppStoryViewerAssemblyInput({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(CANVAS_APP_STORY_VIEWER_STARTER_PROFILE_ID).toBe('story-viewer')
    expect(input).toMatchObject({
      capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
      featurePackProfile: CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
    })
    expect(input.additionalFeaturePackManifests?.map((manifest) =>
      manifest.id
    )).toEqual([
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
  })

  it('assembles minimal viewer controls plus Story Canvas packs', () => {
    const assembly = createCanvasAppStoryViewerAssembly({
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(assembly.capabilities).toEqual(CANVAS_APP_READ_ONLY_CAPABILITIES)
    expect(assembly.installedFeaturePackIds).toEqual([
      'zoom-controls',
      CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    ])
    expect(assembly.enabledFeaturePackIds)
      .toEqual(assembly.installedFeaturePackIds)
    expect(assembly.featurePackViewRenderers.zoomControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.zoomControls,
    )
    expect(assembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(assembly.featurePackViewRenderers.componentPalette).toBeUndefined()
    expect(assembly.inspectorPanels).toEqual([])
    expect(assembly.customItemValidators)
      .toHaveProperty(CANVAS_STORY_PREVIEW_ITEM_KIND)
  })

  it('keeps Story Canvas pack state overrides available for hosts', () => {
    const assembly = createCanvasAppStoryViewerAssembly({
      featurePackStates: [{
        id: CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
        status: 'disabled',
      }],
      renderGroupItem: ({ groupLabel }) => groupLabel,
      renderPreviewItem: ({ storyId }) => storyId,
    })

    expect(assembly.installedFeaturePackIds)
      .toContain(CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id)
    expect(assembly.enabledFeaturePackIds)
      .not.toContain(CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id)
    expect(assembly.installedFeaturePackIds)
      .toContain(CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID)
  })
})

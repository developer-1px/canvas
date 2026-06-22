import { describe, expect, it } from 'vitest'

import {
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
} from '../feature-packs'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
} from '../feature-packs/CanvasAppDefaultViewFeaturePacks'
import {
  CANVAS_APP_READ_ONLY_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  CANVAS_APP_MINIMAL_VIEWER_STARTER_PROFILE_ID,
  createCanvasAppMinimalViewerAssembly,
  createCanvasAppMinimalViewerAssemblyInput,
} from './CanvasAppMinimalViewerStarter'

describe('CanvasAppMinimalViewerStarter', () => {
  it('creates a read-only minimal-viewer assembly input', () => {
    expect(CANVAS_APP_MINIMAL_VIEWER_STARTER_PROFILE_ID)
      .toBe('minimal-viewer')

    expect(createCanvasAppMinimalViewerAssemblyInput()).toMatchObject({
      capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
      featurePackProfile: CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
    })
  })

  it('assembles a viewer starter with only viewer controls enabled', () => {
    const assembly = createCanvasAppMinimalViewerAssembly()

    expect(assembly.capabilities).toEqual(CANVAS_APP_READ_ONLY_CAPABILITIES)
    expect(assembly.installedFeaturePackIds).toEqual(['zoom-controls'])
    expect(assembly.enabledFeaturePackIds).toEqual(['zoom-controls'])
    expect(assembly.featurePackViewRenderers.zoomControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.zoomControls,
    )
    expect(assembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(assembly.featurePackViewRenderers.commandPalette).toBeUndefined()
    expect(assembly.featurePackViewRenderers.minimap).toBeUndefined()
    expect(assembly.inspectorPanels).toEqual([])
  })

  it('keeps feature pack state overrides available for hosts', () => {
    const assembly = createCanvasAppMinimalViewerAssembly({
      featurePackStates: [{
        id: 'zoom-controls',
        status: 'uninstalled',
      }],
    })

    expect(assembly.installedFeaturePackIds).toEqual([])
    expect(assembly.enabledFeaturePackIds).toEqual([])
    expect(assembly.featurePackViewRenderers.zoomControls).toBeUndefined()
  })
})

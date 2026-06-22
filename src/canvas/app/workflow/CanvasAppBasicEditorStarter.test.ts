import { describe, expect, it } from 'vitest'

import {
  CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE,
} from '../feature-packs'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
} from '../feature-packs/CanvasAppDefaultViewFeaturePacks'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  CANVAS_APP_BASIC_EDITOR_STARTER_PROFILE_ID,
  createCanvasAppBasicEditorAssembly,
  createCanvasAppBasicEditorAssemblyInput,
} from './CanvasAppBasicEditorStarter'

describe('CanvasAppBasicEditorStarter', () => {
  it('creates an editor-capable basic-editor assembly input', () => {
    expect(CANVAS_APP_BASIC_EDITOR_STARTER_PROFILE_ID)
      .toBe('basic-editor')

    expect(createCanvasAppBasicEditorAssemblyInput()).toMatchObject({
      capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
      featurePackProfile: CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE,
    })
  })

  it('assembles authoring basics without component, story, or import packs', () => {
    const assembly = createCanvasAppBasicEditorAssembly()

    expect(assembly.capabilities).toEqual(CANVAS_APP_EDITOR_CAPABILITIES)
    expect(assembly.installedFeaturePackIds).toEqual([
      'shape-authoring',
      'command-palette',
      'drawing-tools',
      'stamp-authoring',
      'toolbar',
      'zoom-controls',
    ])
    expect(assembly.enabledFeaturePackIds)
      .toEqual(assembly.installedFeaturePackIds)
    expect(assembly.featurePackViewRenderers.toolbar).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar,
    )
    expect(assembly.featurePackViewRenderers.commandPalette).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.commandPalette,
    )
    expect(assembly.featurePackViewRenderers.drawingControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.drawingControls,
    )
    expect(assembly.featurePackViewRenderers.stampControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.stampControls,
    )
    expect(assembly.featurePackViewRenderers.zoomControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.zoomControls,
    )
    expect(assembly.featurePackViewRenderers.componentPalette).toBeUndefined()
    expect(assembly.featurePackViewRenderers.minimap).toBeUndefined()
    expect(assembly.featurePackViewRenderers.imageControls).toBeUndefined()
    expect(assembly.inspectorPanels).toEqual([])
  })

  it('keeps feature pack state overrides available for hosts', () => {
    const assembly = createCanvasAppBasicEditorAssembly({
      featurePackStates: [{
        id: 'toolbar',
        status: 'disabled',
      }],
    })

    expect(assembly.installedFeaturePackIds).toContain('toolbar')
    expect(assembly.enabledFeaturePackIds).not.toContain('toolbar')
    expect(assembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(assembly.featurePackViewRenderers.commandPalette).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.commandPalette,
    )
  })
})

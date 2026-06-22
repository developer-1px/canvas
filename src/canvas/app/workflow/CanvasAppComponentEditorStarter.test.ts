import { describe, expect, it } from 'vitest'

import {
  CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE,
} from '../feature-packs'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
} from '../feature-packs/CanvasAppDefaultViewFeaturePacks'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
} from './CanvasAppCapabilityAssembly'
import {
  CANVAS_APP_COMPONENT_EDITOR_STARTER_PROFILE_ID,
  createCanvasAppComponentEditorAssembly,
  createCanvasAppComponentEditorAssemblyInput,
} from './CanvasAppComponentEditorStarter'

describe('CanvasAppComponentEditorStarter', () => {
  it('creates an editor-capable component-editor assembly input', () => {
    expect(CANVAS_APP_COMPONENT_EDITOR_STARTER_PROFILE_ID)
      .toBe('component-editor')

    expect(createCanvasAppComponentEditorAssemblyInput()).toMatchObject({
      capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
      featurePackProfile: CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE,
    })
  })

  it('assembles authoring basics plus the component system suite', () => {
    const assembly = createCanvasAppComponentEditorAssembly()

    expect(assembly.capabilities).toEqual(CANVAS_APP_EDITOR_CAPABILITIES)
    expect(assembly.installedFeaturePackIds).toEqual([
      'shape-authoring',
      'component-library',
      'component-source-outline',
      'command-palette',
      'component-authoring',
      'drawing-tools',
      'stamp-authoring',
      'toolbar',
      'zoom-controls',
      'component-sync',
      'component-inspector',
    ])
    expect(assembly.enabledFeaturePackIds)
      .toEqual(assembly.installedFeaturePackIds)
    expect(assembly.featurePackViewRenderers.toolbar).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar,
    )
    expect(assembly.featurePackViewRenderers.componentPalette).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.componentPalette,
    )
    expect(assembly.itemsChangeTransformers.map((transformer) =>
      transformer.id
    )).toEqual(['component-sync-items-change'])
    expect(assembly.inspectorPanels.map((panel) => panel.id))
      .toEqual(['component-binding'])
    expect(assembly.featurePackViewRenderers.minimap).toBeUndefined()
    expect(assembly.featurePackViewRenderers.imageControls).toBeUndefined()
  })

  it('keeps component pack state overrides available for hosts', () => {
    const assembly = createCanvasAppComponentEditorAssembly({
      featurePackStates: [{
        id: 'component-authoring',
        status: 'uninstalled',
      }, {
        id: 'component-inspector',
        status: 'disabled',
      }],
    })

    expect(assembly.installedFeaturePackIds).not.toContain('component-authoring')
    expect(assembly.enabledFeaturePackIds).not.toContain('component-authoring')
    expect(assembly.installedFeaturePackIds).toContain('component-inspector')
    expect(assembly.enabledFeaturePackIds).not.toContain('component-inspector')
    expect(assembly.featurePackViewRenderers.componentPalette).toBeUndefined()
    expect(assembly.inspectorPanels).toEqual([])
    expect(assembly.itemsChangeTransformers.map((transformer) =>
      transformer.id
    )).toEqual(['component-sync-items-change'])
  })
})

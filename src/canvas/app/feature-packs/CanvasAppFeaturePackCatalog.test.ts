import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
} from './CanvasAppDefaultFeaturePackManifests'
import {
  getCanvasAppFeaturePackCatalog,
  resolveCanvasAppFeaturePacks,
} from './CanvasAppFeaturePackCatalog'

describe('CanvasAppFeaturePackCatalog', () => {
  it('returns the built-in feature pack manifest catalog in default order', () => {
    const catalog = getCanvasAppFeaturePackCatalog()

    expect(catalog).toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS)
    expect(Object.isFrozen(catalog)).toBe(true)
    expect(catalog.map((manifest) => manifest.id)).toEqual([
      'command-palette',
      'component-authoring',
      'cursor-chat',
      'drawing-tools',
      'facilitation',
      'find-replace',
      'image-io',
      'minimap',
      'shortcut-help',
      'stamp-authoring',
      'status-bar',
      'toolbar',
      'zoom-controls',
      'table-import',
      'text-paste-import',
      'media-import',
      'arrow-routing-inspector',
      'checklist-inspector',
      'kanban-inspector',
    ])
  })

  it('resolves feature pack ids in requested order', () => {
    const resolved = resolveCanvasAppFeaturePacks([
      'minimap',
      'find-replace',
      'toolbar',
    ])

    expect(Object.isFrozen(resolved)).toBe(true)
    expect(resolved.map((manifest) => manifest.id)).toEqual([
      'minimap',
      'find-replace',
      'toolbar',
    ])
    expect(resolved[0]).toBe(getCanvasAppFeaturePackCatalog()[7])
  })

  it('fails before assembly for malformed, duplicate, or unknown ids', () => {
    expect(() =>
      resolveCanvasAppFeaturePacks(['Minimap']),
    ).toThrow('Invalid canvas app feature pack id id: Minimap')
    expect(() =>
      resolveCanvasAppFeaturePacks(['minimap', 'minimap']),
    ).toThrow('Duplicate canvas app feature pack: minimap')
    expect(() =>
      resolveCanvasAppFeaturePacks(['missing-pack']),
    ).toThrow('Unknown canvas app feature pack: missing-pack')
  })
})

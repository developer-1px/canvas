import { describe, expect, it } from 'vitest'

import {
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
} from './board-io'
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

    expect(Object.isFrozen(catalog)).toBe(true)
    expect(catalog).toEqual([
      ...DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
      CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
    ])
    expect(catalog.map((manifest) => manifest.id)).toEqual([
      'command-palette',
      'component-authoring',
      'cursor-chat',
      'drawing-tools',
      'facilitation',
      'find-replace',
      'image-io',
      'minimap',
      'selection-toolbar',
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
      'board-io',
    ])
    expect(catalog.map((manifest) => manifest.id)).not.toContain('ai-labs')
    expect(catalog.map((manifest) => manifest.id)).not.toContain(
      'dom-edit-style',
    )
  })

  it('resolves static first-party feature pack ids in requested order', () => {
    const resolved = resolveCanvasAppFeaturePacks([
      'minimap',
      'board-io',
      'find-replace',
      'selection-toolbar',
      'toolbar',
    ])

    expect(Object.isFrozen(resolved)).toBe(true)
    expect(resolved.map((manifest) => manifest.id)).toEqual([
      'minimap',
      'board-io',
      'find-replace',
      'selection-toolbar',
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

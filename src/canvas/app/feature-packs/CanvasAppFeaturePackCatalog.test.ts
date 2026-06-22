import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackCatalog,
} from './CanvasAppFeaturePackCatalog'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

describe('CanvasAppFeaturePackCatalog', () => {
  it('derives marketplace catalog items from manifests and runtime state', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      category: 'foundation',
      contributes: {
        surfaces: ['runtime-model'],
      },
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
      provides: ['runtime-capability'],
      version: '1.0.0',
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      category: 'inspection',
      contributes: {
        surfaces: ['inspector'],
      },
      id: 'inspector-pack',
      label: 'Inspector pack',
      optionalRequires: ['audit-pack'],
      requires: ['runtime-capability'],
    })

    const catalog = getCanvasAppFeaturePackCatalog([
      runtimeManifest,
      inspectorManifest,
    ], {
      featurePackStates: [{
        id: 'inspector-pack',
        status: 'disabled',
      }],
    })

    expect(catalog.items.map((item) => ({
      blockedReasons: item.blockedReasons,
      category: item.category,
      enabled: item.enabled,
      id: item.id,
      installed: item.installed,
      package: item.package,
      partialUpdate: item.partialUpdate,
      provides: item.provides,
      requires: item.requires,
      status: item.status,
      version: item.version,
    }))).toEqual([
      {
        blockedReasons: [],
        category: 'foundation',
        package: {
          name: '@interactive-os/canvas',
          subpath: undefined,
        },
        enabled: true,
        id: 'runtime-pack',
        installed: true,
        partialUpdate: ['runtime-model'],
        provides: ['runtime-capability'],
        requires: [],
        status: 'enabled',
        version: '1.0.0',
      },
      {
        blockedReasons: [],
        category: 'inspection',
        package: {
          name: '@interactive-os/canvas',
          subpath: undefined,
        },
        enabled: false,
        id: 'inspector-pack',
        installed: true,
        partialUpdate: [],
        provides: [],
        requires: ['runtime-capability'],
        status: 'disabled',
        version: '0.1.0',
      },
    ])
    expect(catalog.items[1]?.contributes.surfaces).toEqual(['inspector'])
    expect(catalog.items[1]?.optionalRequires).toEqual(['audit-pack'])
    expect(catalog.items[1]?.lifecycle.installable).toBe(true)
    expect(catalog.items[1]?.compatibility.engineVersion).toBe('0.1.x')
  })

  it('reports required pack blockers without throwing graph exceptions', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      provides: ['runtime-capability'],
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      requires: ['runtime-capability'],
    })
    const missingAddonManifest = createCanvasAppFeaturePackManifest({
      id: 'missing-addon-pack',
      label: 'Missing addon pack',
      requires: ['missing-capability'],
    })

    const catalog = getCanvasAppFeaturePackCatalog([
      runtimeManifest,
      addonManifest,
      missingAddonManifest,
    ], {
      featurePackStates: [{
        id: 'runtime-pack',
        status: 'disabled',
      }],
    })

    expect(catalog.items.find((item) => item.id === 'addon-pack')
      ?.blockedReasons).toEqual([{
      featurePackId: 'addon-pack',
      kind: 'disabled-required-pack',
      requiredId: 'runtime-capability',
      scope: 'enabled',
    }])
    expect(catalog.items.find((item) => item.id === 'missing-addon-pack')
      ?.blockedReasons).toEqual([
      {
        featurePackId: 'missing-addon-pack',
        kind: 'missing-required-pack',
        requiredId: 'missing-capability',
        scope: 'installed',
      },
      {
        featurePackId: 'missing-addon-pack',
        kind: 'missing-required-pack',
        requiredId: 'missing-capability',
        scope: 'enabled',
      },
    ])
  })

  it('reports install and enable conflicts without throwing graph exceptions', () => {
    const modernManifest = createCanvasAppFeaturePackManifest({
      conflicts: ['legacy-capability'],
      id: 'modern-pack',
      label: 'Modern pack',
    })
    const legacyManifest = createCanvasAppFeaturePackManifest({
      id: 'legacy-pack',
      label: 'Legacy pack',
      provides: ['legacy-capability'],
    })

    expect(getCanvasAppFeaturePackCatalog([
      modernManifest,
      legacyManifest,
    ]).items.find((item) => item.id === 'modern-pack')?.blockedReasons)
      .toEqual([
        {
          conflictId: 'legacy-capability',
          featurePackId: 'modern-pack',
          kind: 'installed-conflict',
          scope: 'installed',
        },
        {
          conflictId: 'legacy-capability',
          featurePackId: 'modern-pack',
          kind: 'enabled-conflict',
          scope: 'enabled',
        },
      ])

    expect(getCanvasAppFeaturePackCatalog([
      modernManifest,
      legacyManifest,
    ], {
      featurePackStates: [{
        id: 'legacy-pack',
        status: 'disabled',
      }],
    }).items.find((item) => item.id === 'modern-pack')?.blockedReasons)
      .toEqual([{
        conflictId: 'legacy-capability',
        featurePackId: 'modern-pack',
        kind: 'installed-conflict',
        scope: 'installed',
      }])
  })
})

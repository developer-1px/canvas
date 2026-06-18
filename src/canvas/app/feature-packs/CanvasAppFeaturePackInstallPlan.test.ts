import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackInstallPlan,
} from './CanvasAppFeaturePackInstallPlan'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

describe('CanvasAppFeaturePackInstallPlan', () => {
  it('plans enable dependency closure through provided capabilities', () => {
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

    expect(getCanvasAppFeaturePackInstallPlan({
      manifests: [
        runtimeManifest,
        addonManifest,
      ],
      options: {
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'uninstalled',
          },
          {
            id: 'addon-pack',
            status: 'uninstalled',
          },
        ],
      },
      targetFeaturePackIds: ['addon-pack'],
    })).toEqual({
      blockedReasons: [],
      enableFeaturePackIds: ['runtime-pack', 'addon-pack'],
      includedFeaturePackIds: ['runtime-pack', 'addon-pack'],
      installFeaturePackIds: ['runtime-pack', 'addon-pack'],
      mode: 'enable',
      ready: true,
      status: 'ready',
      targetFeaturePackIds: ['addon-pack'],
    })
  })

  it('omits already satisfied dependencies from requested work', () => {
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

    expect(getCanvasAppFeaturePackInstallPlan({
      manifests: [
        runtimeManifest,
        addonManifest,
      ],
      options: {
        featurePackStates: [{
          id: 'addon-pack',
          status: 'uninstalled',
        }],
      },
      targetFeaturePackIds: ['addon-pack'],
    })).toMatchObject({
      blockedReasons: [],
      enableFeaturePackIds: ['addon-pack'],
      includedFeaturePackIds: ['runtime-pack', 'addon-pack'],
      installFeaturePackIds: ['addon-pack'],
      status: 'ready',
    })
  })

  it('plans install-only work without enabling dependencies', () => {
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

    expect(getCanvasAppFeaturePackInstallPlan({
      manifests: [
        runtimeManifest,
        addonManifest,
      ],
      mode: 'install',
      options: {
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'disabled',
          },
          {
            id: 'addon-pack',
            status: 'uninstalled',
          },
        ],
      },
      targetFeaturePackIds: ['addon-pack'],
    })).toMatchObject({
      blockedReasons: [],
      enableFeaturePackIds: [],
      includedFeaturePackIds: ['runtime-pack', 'addon-pack'],
      installFeaturePackIds: ['addon-pack'],
      mode: 'install',
      status: 'ready',
    })
  })

  it('reports unknown targets and missing required capabilities', () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      requires: ['missing-capability'],
    })

    expect(getCanvasAppFeaturePackInstallPlan({
      manifests: [addonManifest],
      options: {
        featurePackStates: [{
          id: 'addon-pack',
          status: 'uninstalled',
        }],
      },
      targetFeaturePackIds: [
        'missing-pack',
        'addon-pack',
      ],
    })).toMatchObject({
      blockedReasons: [
        {
          kind: 'unknown-target-pack',
          targetId: 'missing-pack',
        },
        {
          featurePackId: 'addon-pack',
          kind: 'missing-required-pack',
          requiredId: 'missing-capability',
        },
      ],
      includedFeaturePackIds: ['addon-pack'],
      installFeaturePackIds: ['addon-pack'],
      ready: false,
      status: 'blocked',
    })
  })

  it('reports install and enable conflicts in the planned graph', () => {
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

    expect(getCanvasAppFeaturePackInstallPlan({
      manifests: [
        modernManifest,
        legacyManifest,
      ],
      options: {
        featurePackStates: [{
          id: 'modern-pack',
          status: 'uninstalled',
        }],
      },
      targetFeaturePackIds: ['modern-pack'],
    })).toMatchObject({
      blockedReasons: [
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
      ],
      enableFeaturePackIds: ['modern-pack'],
      installFeaturePackIds: ['modern-pack'],
      status: 'blocked',
    })
  })
})

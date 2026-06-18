import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActions'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

describe('CanvasAppFeaturePackSuiteActions', () => {
  it('describes actions for an enabled suite', () => {
    const overlayManifest = createCanvasAppFeaturePackManifest({
      id: 'overlay-pack',
      label: 'Overlay pack',
      lifecycle: {
        partialUpdate: ['overlay'],
        runtimeToggleable: true,
      },
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      lifecycle: {
        partialUpdate: ['inspector'],
        runtimeToggleable: true,
      },
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: [
        'overlay-pack',
        'inspector-pack',
      ],
      id: 'review-suite',
      label: 'Review suite',
    })

    const item = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
      manifests: [
        overlayManifest,
        inspectorManifest,
      ],
      suiteManifests: [suiteManifest],
    }).items[0]

    expect(item).toMatchObject({
      enabledFeaturePackIds: [
        'overlay-pack',
        'inspector-pack',
      ],
      featurePackIds: [
        'overlay-pack',
        'inspector-pack',
      ],
      installedFeaturePackIds: [
        'overlay-pack',
        'inspector-pack',
      ],
      missingFeaturePackIds: [],
      primaryActionKind: 'disable',
      status: 'enabled',
      suiteId: 'review-suite',
    })
    expect(item?.actions.map((action) => ({
      applicable: action.applicable,
      changedFeaturePackIds: action.changedFeaturePackIds,
      kind: action.kind,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      ready: action.ready,
      status: action.status,
    }))).toEqual([
      {
        applicable: false,
        changedFeaturePackIds: [],
        kind: 'install',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        kind: 'enable',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
      {
        applicable: true,
        changedFeaturePackIds: [
          'overlay-pack',
          'inspector-pack',
        ],
        kind: 'disable',
        partialUpdateSurfaceIds: [
          'overlay',
          'inspector',
        ],
        ready: true,
        status: 'ready',
      },
      {
        applicable: true,
        changedFeaturePackIds: [
          'overlay-pack',
          'inspector-pack',
        ],
        kind: 'uninstall',
        partialUpdateSurfaceIds: [],
        ready: true,
        status: 'ready',
      },
    ])
  })

  it('describes install and enable actions for an uninstalled suite', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
      provides: ['runtime-capability'],
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      lifecycle: {
        partialUpdate: ['inspector'],
        runtimeToggleable: true,
      },
      requires: ['runtime-capability'],
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: [
        'runtime-pack',
        'addon-pack',
      ],
      id: 'addon-suite',
      label: 'Addon suite',
    })

    const item = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
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
      suiteManifests: [suiteManifest],
    }).items[0]

    expect(item).toMatchObject({
      enabledFeaturePackIds: [],
      installedFeaturePackIds: [],
      primaryActionKind: 'install',
      status: 'uninstalled',
    })
    expect(item?.actions.find((action) => action.kind === 'install'))
      .toMatchObject({
        applicable: true,
        changedFeaturePackIds: [
          'runtime-pack',
          'addon-pack',
        ],
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'disabled',
          },
          {
            id: 'addon-pack',
            status: 'disabled',
          },
        ],
        ready: true,
        status: 'ready',
      })
    expect(item?.actions.find((action) => action.kind === 'enable'))
      .toMatchObject({
        applicable: true,
        changedFeaturePackIds: [
          'runtime-pack',
          'addon-pack',
        ],
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'enabled',
          },
          {
            id: 'addon-pack',
            status: 'enabled',
          },
        ],
        partialUpdateSurfaceIds: [
          'runtime-model',
          'inspector',
        ],
        ready: true,
        status: 'ready',
      })
    expect(item?.actions.find((action) => action.kind === 'enable')
      ?.installOptions).toEqual({
      featurePackStates: [
        {
          id: 'runtime-pack',
          status: 'enabled',
        },
        {
          id: 'addon-pack',
          status: 'enabled',
        },
      ],
    })
  })

  it('blocks suite install when a paid member listing is not granted', () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['paid-pack'],
      id: 'paid-suite',
      label: 'Paid suite',
    })

    const item = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
      listings: [{
        access: 'paid',
        distribution: 'coming-soon',
        featurePackId: 'paid-pack',
      }],
      manifests: [paidManifest],
      options: {
        featurePackStates: [{
          id: 'paid-pack',
          status: 'uninstalled',
        }],
      },
      suiteManifests: [suiteManifest],
    }).items[0]

    expect(item?.actions.find((action) => action.kind === 'install'))
      .toMatchObject({
        applicable: true,
        marketplaceBlockedReasons: [
          {
            access: 'paid',
            featurePackId: 'paid-pack',
            kind: 'marketplace-entitlement-required',
          },
          {
            distribution: 'coming-soon',
            featurePackId: 'paid-pack',
            kind: 'marketplace-distribution-unavailable',
          },
        ],
        ready: false,
        status: 'blocked',
      })
  })

  it('keeps suite disable and uninstall available for installed paid members', () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['paid-pack'],
      id: 'paid-suite',
      label: 'Paid suite',
    })

    const item = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
      listings: [{
        access: 'paid',
        featurePackId: 'paid-pack',
      }],
      manifests: [paidManifest],
      suiteManifests: [suiteManifest],
    }).items[0]

    expect(item?.actions.find((action) => action.kind === 'disable'))
      .toMatchObject({
        marketplaceBlockedReasons: [],
        ready: true,
        status: 'ready',
      })
    expect(item?.actions.find((action) => action.kind === 'uninstall'))
      .toMatchObject({
        marketplaceBlockedReasons: [],
        ready: true,
        status: 'ready',
      })
  })

  it('reports partial suite state and missing member blockers', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: [
        'runtime-pack',
        'missing-pack',
      ],
      id: 'broken-suite',
      label: 'Broken suite',
    })

    const item = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
      manifests: [runtimeManifest],
      options: {
        featurePackStates: [{
          id: 'runtime-pack',
          status: 'disabled',
        }],
      },
      suiteManifests: [suiteManifest],
    }).items[0]

    expect(item).toMatchObject({
      enabledFeaturePackIds: [],
      installedFeaturePackIds: ['runtime-pack'],
      missingFeaturePackIds: ['missing-pack'],
      primaryActionKind: 'install',
      status: 'partial',
    })
    expect(item?.actions.find((action) => action.kind === 'enable'))
      .toMatchObject({
        applicable: true,
        blockedReasons: [{
          kind: 'install-plan-blocked',
          reason: {
            kind: 'unknown-target-pack',
            targetId: 'missing-pack',
          },
        }],
        changedFeaturePackIds: ['runtime-pack'],
        partialUpdateSurfaceIds: ['runtime-model'],
        ready: false,
        status: 'blocked',
      })
  })
})

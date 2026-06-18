import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST,
} from './component-authoring'
import {
  CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
} from './component-library'

describe('CanvasAppFeaturePackActions', () => {
  it('describes actions for an enabled runtime-toggleable pack', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'overlay-pack',
      label: 'Overlay pack',
      lifecycle: {
        orphanedDataScopeIds: ['overlay-data'],
        orphanedDataPolicy: 'remove',
        partialUpdate: ['overlay'],
        runtimeToggleable: true,
      },
    })

    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      manifests: [manifest],
    }).items[0]

    expect(item).toMatchObject({
      enabled: true,
      featurePackId: 'overlay-pack',
      installed: true,
      listing: {
        access: 'free',
        distribution: 'available',
        featurePackId: 'overlay-pack',
      },
      primaryActionKind: 'disable',
      status: 'enabled',
    })
    expect(item?.actions.map((action) => ({
      applicable: action.applicable,
      changedFeaturePackIds: action.changedFeaturePackIds,
      kind: action.kind,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      ready: action.ready,
      status: action.status,
      uninstallPolicyEntries: action.uninstallPolicyEntries,
    }))).toEqual([
      {
        applicable: false,
        changedFeaturePackIds: [],
        kind: 'install',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
        uninstallPolicyEntries: [],
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        kind: 'enable',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
        uninstallPolicyEntries: [],
      },
      {
        applicable: true,
        changedFeaturePackIds: ['overlay-pack'],
        kind: 'disable',
        partialUpdateSurfaceIds: ['overlay'],
        ready: true,
        status: 'ready',
        uninstallPolicyEntries: [],
      },
      {
        applicable: true,
        changedFeaturePackIds: ['overlay-pack'],
        kind: 'uninstall',
        partialUpdateSurfaceIds: [],
        ready: true,
        status: 'ready',
        uninstallPolicyEntries: [{
          featurePackId: 'overlay-pack',
          orphanedDataScopeIds: ['overlay-data'],
          orphanedDataPolicy: 'remove',
        }],
      },
    ])
  })

  it('describes install and enable actions for an uninstalled pack', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'command-pack',
      label: 'Command pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })

    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      listings: [{
        access: 'paid',
        distribution: 'available',
        entitlement: 'granted',
        featurePackId: 'command-pack',
        priceLabel: '$9/mo',
        vendor: 'Interactive OS',
      }],
      manifests: [manifest],
      options: {
        featurePackStates: [{
          id: 'command-pack',
          status: 'uninstalled',
        }],
      },
    }).items[0]

    expect(item).toMatchObject({
      enabled: false,
      installed: false,
      listing: {
        access: 'paid',
        distribution: 'available',
        entitlement: 'granted',
        featurePackId: 'command-pack',
        priceLabel: '$9/mo',
        vendor: 'Interactive OS',
      },
      primaryActionKind: 'install',
      status: 'uninstalled',
    })
    expect(item?.actions.map((action) => ({
      applicable: action.applicable,
      changedFeaturePackIds: action.changedFeaturePackIds,
      featurePackStates: action.featurePackStates,
      kind: action.kind,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      ready: action.ready,
      status: action.status,
    }))).toEqual([
      {
        applicable: true,
        changedFeaturePackIds: ['command-pack'],
        featurePackStates: [{
          id: 'command-pack',
          status: 'disabled',
        }],
        kind: 'install',
        partialUpdateSurfaceIds: [],
        ready: true,
        status: 'ready',
      },
      {
        applicable: true,
        changedFeaturePackIds: ['command-pack'],
        featurePackStates: [{
          id: 'command-pack',
          status: 'enabled',
        }],
        kind: 'enable',
        partialUpdateSurfaceIds: ['command'],
        ready: true,
        status: 'ready',
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        featurePackStates: [{
          id: 'command-pack',
          status: 'uninstalled',
        }],
        kind: 'disable',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        featurePackStates: [{
          id: 'command-pack',
          status: 'uninstalled',
        }],
        kind: 'uninstall',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
    ])
    expect(item?.actions.find((action) => action.kind === 'enable')
      ?.installOptions).toEqual({
      featurePackStates: [{
        id: 'command-pack',
        status: 'enabled',
      }],
    })
  })

  it('includes the component runtime dependency in component authoring actions', () => {
    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      manifests: [
        CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST,
      ],
      options: {
        featurePackStates: [
          {
            id: CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
            status: 'uninstalled',
          },
          {
            id: CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
            status: 'uninstalled',
          },
        ],
      },
    }).items.find((candidate) =>
      candidate.featurePackId ===
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id
    )

    expect(item).toMatchObject({
      featurePackId: CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
      primaryActionKind: 'install',
      status: 'uninstalled',
    })
    expect(item?.actions.find((action) => action.kind === 'install'))
      .toMatchObject({
        changedFeaturePackIds: [
          CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
          CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
        ],
        featurePackStates: [
          {
            id: CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
            status: 'disabled',
          },
          {
            id: CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
            status: 'disabled',
          },
        ],
        partialUpdateSurfaceIds: [],
        ready: true,
      })
    expect(item?.actions.find((action) => action.kind === 'enable'))
      .toMatchObject({
        changedFeaturePackIds: [
          CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
          CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
        ],
        featurePackStates: [
          {
            id: CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
            status: 'enabled',
          },
          {
            id: CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
            status: 'enabled',
          },
        ],
        partialUpdateSurfaceIds: ['runtime-model', 'view-renderer'],
        ready: true,
      })
  })

  it('blocks install actions when marketplace listing access is not granted', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })

    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      listings: [{
        access: 'paid',
        distribution: 'coming-soon',
        featurePackId: 'paid-pack',
      }],
      manifests: [manifest],
      options: {
        featurePackStates: [{
          id: 'paid-pack',
          status: 'uninstalled',
        }],
      },
    }).items[0]
    const installAction = item?.actions.find((action) =>
      action.kind === 'install',
    )

    expect(item?.listing).toMatchObject({
      access: 'paid',
      distribution: 'coming-soon',
      entitlement: 'required',
    })
    expect(installAction).toMatchObject({
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

  it('keeps disable and uninstall actions available for installed paid packs', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })

    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      listings: [{
        access: 'paid',
        featurePackId: 'paid-pack',
      }],
      manifests: [manifest],
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

  it('keeps catalog and transition blockers available per action', () => {
    const providerManifest = createCanvasAppFeaturePackManifest({
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
      requires: ['runtime-capability'],
    })

    const model = getCanvasAppFeaturePackMarketplaceActionModel({
      manifests: [
        providerManifest,
        addonManifest,
      ],
      options: {
        featurePackStates: [{
          id: 'runtime-pack',
          status: 'disabled',
        }],
      },
    })
    const providerItem = model.items.find((item) =>
      item.featurePackId === 'runtime-pack',
    )
    const addonItem = model.items.find((item) =>
      item.featurePackId === 'addon-pack',
    )

    expect(addonItem?.catalogBlockedReasons).toEqual([{
      featurePackId: 'addon-pack',
      kind: 'disabled-required-pack',
      requiredId: 'runtime-capability',
      scope: 'enabled',
    }])
    expect(providerItem?.primaryActionKind).toBe('enable')
    expect(providerItem?.actions.find((action) => action.kind === 'uninstall')
      ?.blockedReasons).toEqual([{
      dependentFeaturePackId: 'addon-pack',
      featurePackId: 'runtime-pack',
      kind: 'required-by-installed-pack',
      requiredId: 'runtime-capability',
    }])
  })
})

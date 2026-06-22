import { describe, expect, it } from 'vitest'
import {
  createCanvasMarketplaceFeaturePackListing,
  createCanvasMarketplaceFeaturePackManifest,
  createCanvasMarketplaceFeaturePackProfile,
  createCanvasMarketplaceFeaturePackSuiteManifest,
  getCanvasMarketplaceFeaturePackCatalog,
  getCanvasMarketplaceFeaturePackInstallPlan,
  getCanvasMarketplaceFeaturePackStateTransitionPlan,
  getCanvasMarketplaceFeaturePackSuiteFeaturePackIds,
  getCanvasMarketplaceFeaturePackSuiteListingMap,
  type CanvasMarketplaceFeaturePackManifest,
} from '@interactive-os/canvas/marketplace'

describe('Canvas marketplace package consumer imports', () => {
  it('exposes installable feature package lifecycle kernel as a public subpath', () => {
    const runtimePack = createCanvasMarketplaceFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
      provides: ['runtime-capability'],
    })
    const addonPack = createCanvasMarketplaceFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      lifecycle: {
        orphanedDataPolicy: 'remove',
        orphanedDataScopeIds: ['addon-pack'],
        partialUpdate: ['inspector'],
        runtimeToggleable: true,
      },
      package: {
        name: '@example/canvas-addon-pack',
        subpath: './addon',
      },
      requires: ['runtime-capability'],
    })
    const manifests: readonly CanvasMarketplaceFeaturePackManifest[] = [
      runtimePack,
      addonPack,
    ]

    const catalog = getCanvasMarketplaceFeaturePackCatalog(manifests)
    const installPlan = getCanvasMarketplaceFeaturePackInstallPlan({
      manifests,
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
    })
    const uninstallPlan = getCanvasMarketplaceFeaturePackStateTransitionPlan({
      manifests,
      operation: 'uninstall',
      options: {
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
      },
      targetFeaturePackIds: ['addon-pack'],
    })

    expect(catalog.items.map((item) => item.id)).toEqual([
      'runtime-pack',
      'addon-pack',
    ])
    expect(installPlan).toMatchObject({
      enableFeaturePackIds: ['runtime-pack', 'addon-pack'],
      installFeaturePackIds: ['runtime-pack', 'addon-pack'],
      ready: true,
      status: 'ready',
    })
    expect(uninstallPlan).toMatchObject({
      changedFeaturePackIds: ['addon-pack'],
      ready: true,
      status: 'ready',
      uninstallFeaturePackIds: ['addon-pack'],
      uninstallPolicyEntries: [
        {
          featurePackId: 'addon-pack',
          orphanedDataPolicy: 'remove',
          orphanedDataScopeIds: ['addon-pack'],
        },
      ],
    })
  })

  it('exposes suites, profiles, and listings without importing app feature-pack paths', () => {
    const suite = createCanvasMarketplaceFeaturePackSuiteManifest({
      featurePackIds: ['runtime-pack', 'addon-pack'],
      id: 'addon-suite',
      label: 'Addon suite',
    })
    const profile = createCanvasMarketplaceFeaturePackProfile({
      enabledSuiteIds: ['addon-suite'],
      id: 'addon-profile',
      installedSuiteIds: ['addon-suite'],
      label: 'Addon profile',
      suiteManifests: [suite],
    })
    const listingMap = getCanvasMarketplaceFeaturePackSuiteListingMap({
      listings: [
        {
          access: 'paid',
          distribution: 'available',
          entitlement: 'required',
          priceLabel: '$12',
          suiteId: 'addon-suite',
          vendor: 'Example',
        },
      ],
      suiteManifests: [suite],
    })

    expect(getCanvasMarketplaceFeaturePackSuiteFeaturePackIds(
      [suite],
      profile.enabledSuiteIds,
    )).toEqual(['runtime-pack', 'addon-pack'])
    expect(createCanvasMarketplaceFeaturePackListing({
      access: 'free',
      featurePackId: 'addon-pack',
    })).toMatchObject({
      access: 'free',
      distribution: 'available',
      entitlement: 'granted',
      featurePackId: 'addon-pack',
    })
    expect(listingMap.get('addon-suite')).toMatchObject({
      access: 'paid',
      entitlement: 'required',
      priceLabel: '$12',
      suiteId: 'addon-suite',
    })
  })
})

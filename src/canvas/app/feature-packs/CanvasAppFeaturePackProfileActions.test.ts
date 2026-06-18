import { describe, expect, it } from 'vitest'

import { createCanvasAppFeaturePackManifest } from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import {
  getCanvasAppFeaturePackProfileMarketplaceActionModel,
} from './CanvasAppFeaturePackProfileActions'

describe('CanvasAppFeaturePackProfileActions', () => {
  it('marks a matching profile active', () => {
    const viewManifest = createCanvasAppFeaturePackManifest({
      id: 'view-pack',
      label: 'View pack',
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'viewer-profile',
      installedFeaturePackIds: ['view-pack'],
      label: 'Viewer profile',
    })

    const item = getCanvasAppFeaturePackProfileMarketplaceActionModel({
      manifests: [viewManifest],
      profiles: [profile],
    }).items[0]

    expect(item?.status).toBe('active')
    expect(item?.active).toBe(true)
    expect(item?.currentInstalledFeaturePackIds).toEqual(['view-pack'])
    expect(item?.targetInstalledFeaturePackIds).toEqual(['view-pack'])
    expect(item?.actions[0]).toMatchObject({
      applicable: false,
      changedFeaturePackIds: [],
      kind: 'apply',
      ready: false,
      status: 'active',
    })
  })

  it('plans a profile apply action across enabled, disabled, and uninstalled packs', () => {
    const baseManifest = createCanvasAppFeaturePackManifest({
      id: 'base-pack',
      label: 'Base pack',
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      lifecycle: {
        partialUpdate: ['inspector'],
        runtimeToggleable: true,
      },
    })
    const legacyManifest = createCanvasAppFeaturePackManifest({
      id: 'legacy-pack',
      label: 'Legacy pack',
      lifecycle: {
        orphanedDataPolicy: 'host-managed',
      },
    })
    const profile = createCanvasAppFeaturePackProfile({
      enabledFeaturePackIds: ['base-pack', 'inspector-pack'],
      id: 'authoring-profile',
      installedFeaturePackIds: ['base-pack', 'inspector-pack'],
      label: 'Authoring profile',
    })

    const item = getCanvasAppFeaturePackProfileMarketplaceActionModel({
      manifests: [baseManifest, inspectorManifest, legacyManifest],
      options: {
        featurePackStates: [
          {
            id: 'base-pack',
            status: 'enabled',
          },
          {
            id: 'inspector-pack',
            status: 'disabled',
          },
          {
            id: 'legacy-pack',
            status: 'enabled',
          },
        ],
      },
      profiles: [profile],
    }).items[0]
    const action = item?.actions[0]

    expect(item?.status).toBe('ready')
    expect(item?.active).toBe(false)
    expect(action?.ready).toBe(true)
    expect(action?.changedFeaturePackIds).toEqual([
      'inspector-pack',
      'legacy-pack',
    ])
    expect(action?.partialUpdateSurfaceIds).toEqual(['inspector'])
    expect(action?.featurePackStates).toEqual([
      {
        id: 'base-pack',
        status: 'enabled',
      },
      {
        id: 'inspector-pack',
        status: 'enabled',
      },
      {
        id: 'legacy-pack',
        status: 'uninstalled',
      },
    ])
    expect(action?.uninstallPolicyEntries).toEqual([{
      featurePackId: 'legacy-pack',
      orphanedDataPolicy: 'host-managed',
    }])
    expect(action?.installOptions).toEqual({
      featurePackStates: [
        {
          id: 'base-pack',
          status: 'enabled',
        },
        {
          id: 'inspector-pack',
          status: 'enabled',
        },
        {
          id: 'legacy-pack',
          status: 'uninstalled',
        },
      ],
    })
  })

  it('exposes unknown profile packs as blockers instead of throwing', () => {
    const knownManifest = createCanvasAppFeaturePackManifest({
      id: 'known-pack',
      label: 'Known pack',
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'external-profile',
      installedFeaturePackIds: ['known-pack', 'missing-pack'],
      label: 'External profile',
    })

    const item = getCanvasAppFeaturePackProfileMarketplaceActionModel({
      manifests: [knownManifest],
      profiles: [profile],
    }).items[0]

    expect(item?.status).toBe('blocked')
    expect(item?.missingFeaturePackIds).toEqual(['missing-pack'])
    expect(item?.actions[0]?.blockedReasons).toContainEqual({
      featurePackId: 'missing-pack',
      kind: 'unknown-profile-pack',
      profileId: 'external-profile',
    })
  })

  it('blocks profile apply when a paid target listing is not granted', () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'paid-profile',
      installedFeaturePackIds: ['paid-pack'],
      label: 'Paid profile',
    })

    const item = getCanvasAppFeaturePackProfileMarketplaceActionModel({
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
      profiles: [profile],
    }).items[0]

    expect(item?.status).toBe('blocked')
    expect(item?.actions[0]).toMatchObject({
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

  it('blocks profile targets that violate required feature pack graph', () => {
    const baseManifest = createCanvasAppFeaturePackManifest({
      id: 'base-pack',
      label: 'Base pack',
    })
    const pluginManifest = createCanvasAppFeaturePackManifest({
      id: 'plugin-pack',
      label: 'Plugin pack',
      requires: ['base-pack'],
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'plugin-profile',
      installedFeaturePackIds: ['plugin-pack'],
      label: 'Plugin profile',
    })

    const item = getCanvasAppFeaturePackProfileMarketplaceActionModel({
      manifests: [baseManifest, pluginManifest],
      profiles: [profile],
    }).items[0]

    expect(item?.status).toBe('blocked')
    expect(item?.actions[0]?.blockedReasons).toEqual(
      expect.arrayContaining([
        {
          featurePackId: 'plugin-pack',
          kind: 'uninstalled-required-pack',
          profileId: 'plugin-profile',
          requiredId: 'base-pack',
          scope: 'installed',
        },
        {
          featurePackId: 'plugin-pack',
          kind: 'uninstalled-required-pack',
          profileId: 'plugin-profile',
          requiredId: 'base-pack',
          scope: 'enabled',
        },
      ]),
    )
  })

  it('blocks profile runtime toggles when the manifest cannot update in place', () => {
    const lockedManifest = createCanvasAppFeaturePackManifest({
      id: 'locked-pack',
      label: 'Locked pack',
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'locked-profile',
      installedFeaturePackIds: ['locked-pack'],
      label: 'Locked profile',
    })

    const item = getCanvasAppFeaturePackProfileMarketplaceActionModel({
      manifests: [lockedManifest],
      options: {
        featurePackStates: [{
          id: 'locked-pack',
          status: 'disabled',
        }],
      },
      profiles: [profile],
    }).items[0]

    expect(item?.status).toBe('blocked')
    expect(item?.actions[0]?.blockedReasons).toEqual(
      expect.arrayContaining([
        {
          featurePackId: 'locked-pack',
          kind: 'runtime-toggle-unavailable',
          profileId: 'locked-profile',
        },
        {
          kind: 'partial-update-blocked',
          profileId: 'locked-profile',
          reason: {
            featurePackId: 'locked-pack',
            kind: 'empty-partial-update',
          },
        },
      ]),
    )
  })
})

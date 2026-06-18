import { describe, expect, it } from 'vitest'

import {
  getCanvasAppFeaturePackMarketplaceModel,
} from './CanvasAppFeaturePackMarketplace'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE,
  createCanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import {
  createCanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

describe('CanvasAppFeaturePackMarketplace', () => {
  it('groups default profiles, suites, and packs into stable sections', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'zoom-controls',
      label: 'Zoom controls',
    })

    const model = getCanvasAppFeaturePackMarketplaceModel({
      manifests: [manifest],
    })

    expect(model.sections.map((section) => section.kind)).toEqual([
      'profiles',
      'suites',
      'packs',
    ])
    expect(model.sections[0]?.items).toBe(model.profiles.items)
    expect(model.sections[1]?.items).toBe(model.suites.items)
    expect(model.sections[2]?.items).toBe(model.packs.items)
    expect(model.sections[2]?.summary).toEqual({
      blockedActionCount: 1,
      enabledItemCount: 1,
      installedItemCount: 1,
      itemCount: 1,
      paidItemCount: 0,
      privateItemCount: 0,
      readyActionCount: 1,
    })
    expect(model.profiles.items[0]?.profileId)
      .toBe(CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE.id)
    expect(model.packs.items[0]?.featurePackId).toBe('zoom-controls')
  })

  it('uses custom profiles, suites, and options in each section', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['runtime-pack', 'addon-pack'],
      id: 'addon-suite',
      label: 'Addon suite',
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'runtime-profile',
      installedFeaturePackIds: ['runtime-pack'],
      label: 'Runtime profile',
    })

    const model = getCanvasAppFeaturePackMarketplaceModel({
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'addon-pack',
        vendor: 'Internal',
      }],
      manifests: [runtimeManifest, addonManifest],
      options: {
        featurePackStates: [{
          id: 'addon-pack',
          status: 'uninstalled',
        }],
      },
      profiles: [profile],
      suiteManifests: [suiteManifest],
    })

    expect(model.profiles.items.map((item) => item.profileId))
      .toEqual(['runtime-profile'])
    expect(model.suites.items.map((item) => item.suiteId))
      .toEqual(['addon-suite'])
    expect(model.packs.items.map((item) => item.featurePackId)).toEqual([
      'runtime-pack',
      'addon-pack',
    ])
    expect(model.suites.items[0]?.status).toBe('partial')
    expect(model.packs.items[1]?.status).toBe('uninstalled')
    expect(model.packs.items[1]?.listing).toEqual({
      access: 'private',
      distribution: 'available',
      entitlement: 'required',
      featurePackId: 'addon-pack',
      priceLabel: undefined,
      vendor: 'Internal',
    })
    expect(model.packs.sections).toBeUndefined()
    expect(model.sections[0]?.summary).toEqual({
      activeItemCount: 1,
      blockedActionCount: 0,
      itemCount: 1,
      readyActionCount: 0,
    })
    expect(model.sections[1]?.summary).toEqual({
      blockedActionCount: 3,
      enabledItemCount: 0,
      itemCount: 1,
      readyActionCount: 1,
    })
    expect(model.sections[2]?.summary).toEqual({
      blockedActionCount: 3,
      enabledItemCount: 1,
      installedItemCount: 1,
      itemCount: 2,
      paidItemCount: 0,
      privateItemCount: 1,
      readyActionCount: 1,
    })
    expect(model.profiles.items[0]?.actions[0]?.installOptions).toEqual({
      featurePackStates: [
        {
          id: 'runtime-pack',
          status: 'enabled',
        },
        {
          id: 'addon-pack',
          status: 'uninstalled',
        },
      ],
    })
  })
})

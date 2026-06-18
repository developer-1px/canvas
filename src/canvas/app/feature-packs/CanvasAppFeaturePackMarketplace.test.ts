import { describe, expect, it } from 'vitest'

import {
  getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
  getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel,
  getCanvasAppFeaturePackMarketplaceSectionFacetItems,
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
      activationFailedItemCount: 0,
      blockedActionCount: 1,
      enabledItemCount: 1,
      installedItemCount: 1,
      itemCount: 1,
      paidItemCount: 0,
      partiallyUpdatedItemCount: 0,
      primaryBlockedItemCount: 1,
      primaryReadyItemCount: 0,
      privateItemCount: 0,
      readyActionCount: 1,
      rollbackAvailableItemCount: 0,
      updatingItemCount: 0,
    })
    expect(model.sections[2]?.facets).toEqual([
      { count: 1, kind: 'all', label: 'All' },
      { count: 1, kind: 'installed', label: 'Installed' },
      { count: 1, kind: 'enabled', label: 'Enabled' },
      { count: 0, kind: 'paid', label: 'Paid' },
      { count: 0, kind: 'private', label: 'Private' },
      { count: 0, kind: 'updating', label: 'Updating' },
      { count: 0, kind: 'partially-updated', label: 'Partially updated' },
      { count: 0, kind: 'activation-failed', label: 'Activation failed' },
      { count: 0, kind: 'rollback-available', label: 'Rollback available' },
      { count: 1, kind: 'ready', label: 'Ready' },
      { count: 1, kind: 'blocked', label: 'Blocked' },
    ])
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
      primaryBlockedItemCount: 0,
      primaryReadyItemCount: 0,
      readyActionCount: 0,
    })
    expect(model.sections[0]?.facets).toEqual([
      { count: 1, kind: 'all', label: 'All' },
      { count: 1, kind: 'active', label: 'Active' },
      { count: 0, kind: 'ready', label: 'Ready' },
      { count: 0, kind: 'blocked', label: 'Blocked' },
    ])
    expect(model.sections[1]?.summary).toEqual({
      blockedActionCount: 3,
      enabledItemCount: 0,
      itemCount: 1,
      primaryBlockedItemCount: 1,
      primaryReadyItemCount: 0,
      readyActionCount: 1,
    })
    expect(model.sections[1]?.facets).toEqual([
      { count: 1, kind: 'all', label: 'All' },
      { count: 0, kind: 'enabled', label: 'Enabled' },
      { count: 1, kind: 'ready', label: 'Ready' },
      { count: 1, kind: 'blocked', label: 'Blocked' },
    ])
    expect(model.sections[2]?.summary).toEqual({
      activationFailedItemCount: 0,
      blockedActionCount: 3,
      enabledItemCount: 1,
      installedItemCount: 1,
      itemCount: 2,
      paidItemCount: 0,
      partiallyUpdatedItemCount: 0,
      primaryBlockedItemCount: 2,
      primaryReadyItemCount: 0,
      privateItemCount: 1,
      readyActionCount: 1,
      rollbackAvailableItemCount: 0,
      updatingItemCount: 0,
    })
    expect(model.sections[2]?.facets).toEqual([
      { count: 2, kind: 'all', label: 'All' },
      { count: 1, kind: 'installed', label: 'Installed' },
      { count: 1, kind: 'enabled', label: 'Enabled' },
      { count: 0, kind: 'paid', label: 'Paid' },
      { count: 1, kind: 'private', label: 'Private' },
      { count: 0, kind: 'updating', label: 'Updating' },
      { count: 0, kind: 'partially-updated', label: 'Partially updated' },
      { count: 0, kind: 'activation-failed', label: 'Activation failed' },
      { count: 0, kind: 'rollback-available', label: 'Rollback available' },
      { count: 1, kind: 'ready', label: 'Ready' },
      { count: 2, kind: 'blocked', label: 'Blocked' },
    ])
    const profileSection = model.sections[0]
    const suiteSection = model.sections[1]
    const packSection = model.sections[2]

    if (profileSection?.kind !== 'profiles') {
      throw new Error('Expected profiles section')
    }

    if (suiteSection?.kind !== 'suites') {
      throw new Error('Expected suites section')
    }

    if (packSection?.kind !== 'packs') {
      throw new Error('Expected packs section')
    }

    const profileItem = profileSection.items[0]
    const suiteItem = suiteSection.items[0]
    const addonPackItem = packSection.items[1]

    if (!profileItem || !suiteItem || !addonPackItem) {
      throw new Error('Expected marketplace items')
    }

    const profilePrimaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(profileItem)
    const suitePrimaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(suiteItem)
    const addonPackPrimaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(addonPackItem)

    expect(profilePrimaryAction.kind).toBe('apply')
    expect(profilePrimaryAction.status).toBe('active')
    expect(suitePrimaryAction.kind).toBe('install')
    expect(suitePrimaryAction.status).toBe('blocked')
    expect(addonPackPrimaryAction.kind).toBe('install')
    expect(addonPackPrimaryAction.status).toBe('blocked')
    expect(addonPackPrimaryAction.marketplaceBlockedReasons.map(
      (reason) => reason.kind,
    )).toEqual(['marketplace-entitlement-required'])
    const addonPackPrimaryActionDiagnostic =
      getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(addonPackItem)

    expect(addonPackPrimaryActionDiagnostic.action)
      .toBe(addonPackPrimaryAction)
    expect(addonPackPrimaryActionDiagnostic).toMatchObject({
      actionKind: 'install',
      applicable: true,
      blockedReasonCount: 0,
      changedFeaturePackIds: ['addon-pack'],
      marketplaceBlockedReasonCount: 1,
      partialUpdateSurfaceIds: [],
      ready: false,
      status: 'blocked',
      totalBlockedReasonCount: 1,
      uninstallPolicyEntries: [],
    })
    expect(Object.isFrozen(addonPackPrimaryActionDiagnostic)).toBe(true)
    const packSectionPrimaryActionDiagnosticModel =
      getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel(
        packSection,
      )

    expect(packSectionPrimaryActionDiagnosticModel.all.map((diagnostic) =>
      diagnostic.actionKind
    )).toEqual(['disable', 'install'])
    expect(packSectionPrimaryActionDiagnosticModel.ready.map((diagnostic) =>
      diagnostic.changedFeaturePackIds,
    )).toEqual([])
    expect(packSectionPrimaryActionDiagnosticModel.blocked.map((diagnostic) =>
      diagnostic.changedFeaturePackIds,
    )).toEqual([['runtime-pack'], ['addon-pack']])
    expect(Object.isFrozen(packSectionPrimaryActionDiagnosticModel)).toBe(true)
    expect(Object.isFrozen(packSectionPrimaryActionDiagnosticModel.all))
      .toBe(true)
    expect(Object.isFrozen(packSectionPrimaryActionDiagnosticModel.ready))
      .toBe(true)
    expect(Object.isFrozen(packSectionPrimaryActionDiagnosticModel.blocked))
      .toBe(true)
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'active',
      section: profileSection,
    }).map((item) => item.profileId)).toEqual(['runtime-profile'])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'blocked',
      section: suiteSection,
    }).map((item) => item.suiteId)).toEqual(['addon-suite'])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'ready',
      section: packSection,
    }).map((item) => item.featurePackId)).toEqual(['runtime-pack'])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'private',
      section: packSection,
    }).map((item) => item.featurePackId)).toEqual(['addon-pack'])
    const blockedPackItems =
      getCanvasAppFeaturePackMarketplaceSectionFacetItems({
        facetKind: 'blocked',
        section: packSection,
      })

    expect(blockedPackItems.map((item) => item.featurePackId)).toEqual([
      'runtime-pack',
      'addon-pack',
    ])
    expect(Object.isFrozen(blockedPackItems)).toBe(true)
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

  it('surfaces pack lifecycle status facets for update and rollback states', () => {
    const updatingManifest = createCanvasAppFeaturePackManifest({
      id: 'updating-pack',
      label: 'Updating pack',
    })
    const partialManifest = createCanvasAppFeaturePackManifest({
      id: 'partial-pack',
      label: 'Partial pack',
    })
    const failedManifest = createCanvasAppFeaturePackManifest({
      id: 'failed-pack',
      label: 'Failed pack',
    })
    const rollbackManifest = createCanvasAppFeaturePackManifest({
      id: 'rollback-pack',
      label: 'Rollback pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceModel({
      manifests: [
        updatingManifest,
        partialManifest,
        failedManifest,
        rollbackManifest,
      ],
      options: {
        featurePackStates: [
          {
            id: 'updating-pack',
            status: 'updating',
          },
          {
            id: 'partial-pack',
            status: 'partially-updated',
          },
          {
            id: 'failed-pack',
            status: 'activation-failed',
          },
          {
            id: 'rollback-pack',
            status: 'rollback-available',
          },
        ],
      },
    })
    const packSection = model.sections[2]

    if (packSection?.kind !== 'packs') {
      throw new Error('Expected packs section')
    }

    expect(packSection.summary).toMatchObject({
      activationFailedItemCount: 1,
      partiallyUpdatedItemCount: 1,
      rollbackAvailableItemCount: 1,
      updatingItemCount: 1,
    })
    expect(packSection.facets.filter((facet) =>
      facet.kind === 'updating' ||
      facet.kind === 'partially-updated' ||
      facet.kind === 'activation-failed' ||
      facet.kind === 'rollback-available'
    )).toEqual([
      { count: 1, kind: 'updating', label: 'Updating' },
      { count: 1, kind: 'partially-updated', label: 'Partially updated' },
      { count: 1, kind: 'activation-failed', label: 'Activation failed' },
      { count: 1, kind: 'rollback-available', label: 'Rollback available' },
    ])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'updating',
      section: packSection,
    }).map((item) => item.featurePackId)).toEqual(['updating-pack'])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'partially-updated',
      section: packSection,
    }).map((item) => item.featurePackId)).toEqual(['partial-pack'])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'activation-failed',
      section: packSection,
    }).map((item) => item.featurePackId)).toEqual(['failed-pack'])
    expect(getCanvasAppFeaturePackMarketplaceSectionFacetItems({
      facetKind: 'rollback-available',
      section: packSection,
    }).map((item) => item.featurePackId)).toEqual(['rollback-pack'])
  })
})

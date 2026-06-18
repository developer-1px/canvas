import {
  getCanvasAppFeaturePackMarketplaceActionModel,
  type CanvasAppFeaturePackMarketplaceActionItem,
  type CanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import {
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  getCanvasAppFeaturePackProfileMarketplaceActionModel,
  type CanvasAppFeaturePackProfileMarketplaceActionItem,
  type CanvasAppFeaturePackProfileMarketplaceActionModel,
} from './CanvasAppFeaturePackProfileActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  type CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import {
  getCanvasAppFeaturePackSuiteMarketplaceActionModel,
  type CanvasAppFeaturePackSuiteMarketplaceActionItem,
  type CanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
} from './CanvasAppDefaultFeaturePackSuites'
import {
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

export type CanvasAppFeaturePackMarketplaceSectionKind =
  | 'packs'
  | 'profiles'
  | 'suites'

export type CanvasAppFeaturePackMarketplaceModel = Readonly<{
  packs: CanvasAppFeaturePackMarketplaceActionModel
  profiles: CanvasAppFeaturePackProfileMarketplaceActionModel
  sections: readonly CanvasAppFeaturePackMarketplaceSection[]
  suites: CanvasAppFeaturePackSuiteMarketplaceActionModel
}>

export type CanvasAppFeaturePackMarketplaceSection =
  | CanvasAppFeaturePackMarketplacePackSection
  | CanvasAppFeaturePackMarketplaceProfileSection
  | CanvasAppFeaturePackMarketplaceSuiteSection

export type CanvasAppFeaturePackMarketplaceProfileSection = Readonly<{
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
  kind: 'profiles'
  label: string
  summary: CanvasAppFeaturePackMarketplaceProfileSectionSummary
}>

export type CanvasAppFeaturePackMarketplaceSuiteSection = Readonly<{
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
  kind: 'suites'
  label: string
  summary: CanvasAppFeaturePackMarketplaceSuiteSectionSummary
}>

export type CanvasAppFeaturePackMarketplacePackSection = Readonly<{
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
  kind: 'packs'
  label: string
  summary: CanvasAppFeaturePackMarketplacePackSectionSummary
}>

export type CanvasAppFeaturePackMarketplaceActionSectionSummary =
  Readonly<{
    blockedActionCount: number
    itemCount: number
    readyActionCount: number
  }>

export type CanvasAppFeaturePackMarketplaceProfileSectionSummary =
  CanvasAppFeaturePackMarketplaceActionSectionSummary & Readonly<{
    activeItemCount: number
  }>

export type CanvasAppFeaturePackMarketplaceSuiteSectionSummary =
  CanvasAppFeaturePackMarketplaceActionSectionSummary & Readonly<{
    enabledItemCount: number
  }>

export type CanvasAppFeaturePackMarketplacePackSectionSummary =
  CanvasAppFeaturePackMarketplaceActionSectionSummary & Readonly<{
    enabledItemCount: number
    installedItemCount: number
    paidItemCount: number
    privateItemCount: number
}>

export function getCanvasAppFeaturePackMarketplaceModel({
  listings = [],
  manifests,
  options = {},
  profiles = DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  suiteManifests = DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
  profiles?: readonly CanvasAppFeaturePackProfile[]
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}): CanvasAppFeaturePackMarketplaceModel {
  const profileActions = getCanvasAppFeaturePackProfileMarketplaceActionModel({
    listings,
    manifests,
    options,
    profiles,
  })
  const suiteActions = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
    listings,
    manifests,
    options,
    suiteManifests,
  })
  const packActions = getCanvasAppFeaturePackMarketplaceActionModel({
    listings,
    manifests,
    options,
  })

  return Object.freeze({
    packs: packActions,
    profiles: profileActions,
    sections: Object.freeze([
      Object.freeze({
        items: profileActions.items,
        kind: 'profiles',
        label: 'Profiles',
        summary: getCanvasAppFeaturePackMarketplaceProfileSectionSummary(
          profileActions.items,
        ),
      }),
      Object.freeze({
        items: suiteActions.items,
        kind: 'suites',
        label: 'Suites',
        summary: getCanvasAppFeaturePackMarketplaceSuiteSectionSummary(
          suiteActions.items,
        ),
      }),
      Object.freeze({
        items: packActions.items,
        kind: 'packs',
        label: 'Feature packs',
        summary: getCanvasAppFeaturePackMarketplacePackSectionSummary(
          packActions.items,
        ),
      }),
    ]),
    suites: suiteActions,
  })
}

function getCanvasAppFeaturePackMarketplaceProfileSectionSummary(
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplaceProfileSectionSummary {
  return Object.freeze({
    activeItemCount: items.filter((item) => item.active).length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplaceSuiteSectionSummary(
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplaceSuiteSectionSummary {
  return Object.freeze({
    enabledItemCount: items.filter((item) => item.status === 'enabled').length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplacePackSectionSummary(
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplacePackSectionSummary {
  return Object.freeze({
    enabledItemCount: items.filter((item) => item.enabled).length,
    installedItemCount: items.filter((item) => item.installed).length,
    paidItemCount: items.filter((item) => item.listing.access === 'paid').length,
    privateItemCount: items.filter((item) =>
      item.listing.access === 'private'
    ).length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplaceActionSectionSummary(
  items: readonly {
    actions: readonly {
      applicable: boolean
      ready: boolean
      status: 'active' | 'blocked' | 'ready'
    }[]
  }[],
): CanvasAppFeaturePackMarketplaceActionSectionSummary {
  const actions = items.flatMap((item) => item.actions)

  return Object.freeze({
    blockedActionCount: actions.filter((action) =>
      action.applicable && action.status === 'blocked'
    ).length,
    itemCount: items.length,
    readyActionCount: actions.filter((action) => action.ready).length,
  })
}

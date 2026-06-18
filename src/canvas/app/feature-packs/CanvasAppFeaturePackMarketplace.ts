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
}>

export type CanvasAppFeaturePackMarketplaceSuiteSection = Readonly<{
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
  kind: 'suites'
  label: string
}>

export type CanvasAppFeaturePackMarketplacePackSection = Readonly<{
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
  kind: 'packs'
  label: string
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
    manifests,
    options,
    profiles,
  })
  const suiteActions = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
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
      }),
      Object.freeze({
        items: suiteActions.items,
        kind: 'suites',
        label: 'Suites',
      }),
      Object.freeze({
        items: packActions.items,
        kind: 'packs',
        label: 'Feature packs',
      }),
    ]),
    suites: suiteActions,
  })
}

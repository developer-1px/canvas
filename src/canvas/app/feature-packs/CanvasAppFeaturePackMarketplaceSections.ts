import {
  getCanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
} from './CanvasAppDefaultFeaturePackSuites'
import type {
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackMarketplaceListingInput,
  CanvasAppFeaturePackSuiteMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  getCanvasAppFeaturePackMarketplacePackSectionFacets,
  getCanvasAppFeaturePackMarketplaceProfileSectionFacets,
  getCanvasAppFeaturePackMarketplaceSuiteSectionFacets,
} from './CanvasAppFeaturePackMarketplaceSectionFacets'
export {
  getCanvasAppFeaturePackMarketplaceSectionFacetItems,
  isCanvasAppFeaturePackMarketplacePackSectionFacetKind,
  isCanvasAppFeaturePackMarketplaceProfileSectionFacetKind,
  isCanvasAppFeaturePackMarketplaceSuiteSectionFacetKind,
} from './CanvasAppFeaturePackMarketplaceSectionFacetItems'
import {
  getCanvasAppFeaturePackMarketplacePackSectionSummary,
  getCanvasAppFeaturePackMarketplaceProfileSectionSummary,
  getCanvasAppFeaturePackMarketplaceSuiteSectionSummary,
} from './CanvasAppFeaturePackMarketplaceSectionSummaries'
import {
  getCanvasAppFeaturePackProfileMarketplaceActionModel,
} from './CanvasAppFeaturePackProfileActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  type CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import {
  getCanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActions'
import type {
  CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'
export type {
  CanvasAppFeaturePackMarketplaceActionSectionSummary,
  CanvasAppFeaturePackMarketplaceItem,
  CanvasAppFeaturePackMarketplaceModel,
  CanvasAppFeaturePackMarketplacePackSection,
  CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplacePackSectionFacetKind,
  CanvasAppFeaturePackMarketplacePackSectionSummary,
  CanvasAppFeaturePackMarketplaceProfileSection,
  CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplaceProfileSectionFacetKind,
  CanvasAppFeaturePackMarketplaceProfileSectionSummary,
  CanvasAppFeaturePackMarketplaceSection,
  CanvasAppFeaturePackMarketplaceSectionFacet,
  CanvasAppFeaturePackMarketplaceSectionFacetItems,
  CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplaceSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSectionKind,
  CanvasAppFeaturePackMarketplaceSectionSummary,
  CanvasAppFeaturePackMarketplaceSuiteSection,
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSuiteSectionSummary,
} from './CanvasAppFeaturePackMarketplaceSectionContracts'
import type {
  CanvasAppFeaturePackMarketplaceModel,
} from './CanvasAppFeaturePackMarketplaceSectionContracts'

export function getCanvasAppFeaturePackMarketplaceModel({
  listings = [],
  manifests,
  options = {},
  profiles = DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  suiteListings = [],
  suiteManifests = DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
  profiles?: readonly CanvasAppFeaturePackProfile[]
  suiteListings?: readonly CanvasAppFeaturePackSuiteMarketplaceListingInput[]
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
    suiteListings,
    suiteManifests,
  })
  const packActions = getCanvasAppFeaturePackMarketplaceActionModel({
    listings,
    manifests,
    options,
  })
  const profileSummary =
    getCanvasAppFeaturePackMarketplaceProfileSectionSummary(
      profileActions.items,
    )
  const suiteSummary = getCanvasAppFeaturePackMarketplaceSuiteSectionSummary(
    suiteActions.items,
  )
  const packSummary = getCanvasAppFeaturePackMarketplacePackSectionSummary(
    packActions.items,
  )

  return Object.freeze({
    packs: packActions,
    profiles: profileActions,
    sections: Object.freeze([
      Object.freeze({
        facets: getCanvasAppFeaturePackMarketplaceProfileSectionFacets({
          items: profileActions.items,
          summary: profileSummary,
        }),
        items: profileActions.items,
        kind: 'profiles',
        label: 'Profiles',
        summary: profileSummary,
      }),
      Object.freeze({
        facets: getCanvasAppFeaturePackMarketplaceSuiteSectionFacets({
          items: suiteActions.items,
          summary: suiteSummary,
        }),
        items: suiteActions.items,
        kind: 'suites',
        label: 'Suites',
        summary: suiteSummary,
      }),
      Object.freeze({
        facets: getCanvasAppFeaturePackMarketplacePackSectionFacets({
          items: packActions.items,
          summary: packSummary,
        }),
        items: packActions.items,
        kind: 'packs',
        label: 'Feature packs',
        summary: packSummary,
      }),
    ]),
    suites: suiteActions,
  })
}

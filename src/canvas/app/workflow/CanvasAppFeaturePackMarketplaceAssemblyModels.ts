import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  getCanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackMarketplaceListingInput,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackSuiteManifest,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import {
  getCanvasAppAssemblyFeaturePackManifests,
  getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions,
  getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput,
  snapshotCanvasAppFeaturePackManifests,
  snapshotCanvasAppFeaturePackMarketplaceListings,
  snapshotCanvasAppFeaturePackProfiles,
  snapshotCanvasAppFeaturePackSuiteManifests,
} from './CanvasAppFeaturePackAssemblyInputs'

export type CanvasAppFeaturePackMarketplaceAssemblyModelInput = Readonly<{
  assemblyInput?: CanvasAppFeaturePackAssemblyInput
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  profiles?: readonly CanvasAppFeaturePackProfile[]
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackMarketplaceAssemblyModel = Readonly<{
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  featurePackManifests: readonly CanvasAppFeaturePackManifest[]
  installOptions: CanvasAppFeaturePackInstallOptions
  listings: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  marketplaceModel: CanvasAppFeaturePackMarketplaceModel
  profiles: readonly CanvasAppFeaturePackProfile[]
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export function getCanvasAppFeaturePackMarketplaceAssemblyModel({
  assemblyInput = {},
  listings = [],
  profiles,
  suiteManifests,
}: CanvasAppFeaturePackMarketplaceAssemblyModelInput = {}):
  CanvasAppFeaturePackMarketplaceAssemblyModel {
  const featurePackManifests = snapshotCanvasAppFeaturePackManifests(
    getCanvasAppAssemblyFeaturePackManifests(assemblyInput),
  )
  const installOptions =
    getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions({
      assemblyInput,
      featurePackManifests,
    })
  const canonicalAssemblyInput =
    getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
      assemblyInput,
      installOptions,
    })
  const marketplaceListings =
    snapshotCanvasAppFeaturePackMarketplaceListings(listings)
  const marketplaceProfiles = snapshotCanvasAppFeaturePackProfiles(
    profiles ?? assemblyInput.featurePackProfiles ??
      DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  )
  const marketplaceSuiteManifests = snapshotCanvasAppFeaturePackSuiteManifests(
    suiteManifests ?? DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  )

  return Object.freeze({
    assemblyInput: canonicalAssemblyInput,
    featurePackManifests,
    installOptions,
    listings: marketplaceListings,
    marketplaceModel: getCanvasAppFeaturePackMarketplaceModel({
      listings: marketplaceListings,
      manifests: featurePackManifests,
      options: installOptions,
      profiles: marketplaceProfiles,
      suiteManifests: marketplaceSuiteManifests,
    }),
    profiles: marketplaceProfiles,
    suiteManifests: marketplaceSuiteManifests,
  })
}

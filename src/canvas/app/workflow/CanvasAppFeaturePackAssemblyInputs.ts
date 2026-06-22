import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  assertCanvasAppFeaturePackViewRenderers,
  getCanvasAppFeatureFlagRuntimeStateInputs,
  getCanvasAppFeaturePackProfileById,
  getCanvasAppFeaturePackProfileRuntimeStates,
  getCanvasAppResolvedFeaturePackStates,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackInstallOptions,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackMarketplaceListingInput,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackRuntimeStateInput,
  type CanvasAppFeaturePackSuiteManifest,
  type CanvasAppFeaturePackViewRenderers,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackMarketplaceAssemblyModels'

export function getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
  assemblyInput,
  installOptions,
}: {
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  installOptions: CanvasAppFeaturePackInstallOptions
}): CanvasAppFeaturePackAssemblyInput {
  const canonicalAssemblyInput: CanvasAppFeaturePackAssemblyInput = {
    ...assemblyInput,
  }

  delete canonicalAssemblyInput.disabledFeaturePackIds
  delete canonicalAssemblyInput.featureFlagSettings
  delete canonicalAssemblyInput.featurePackProfile
  delete canonicalAssemblyInput.featurePackProfileId

  return Object.freeze({
    ...canonicalAssemblyInput,
    featurePackStates: installOptions.featurePackStates,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyInstallOptions({
  assemblyInput,
  featurePackManifests,
}: {
  assemblyInput: CanvasAppFeaturePackAssemblyInput
  featurePackManifests: readonly CanvasAppFeaturePackManifest[]
}): CanvasAppFeaturePackInstallOptions {
  const installOptions = getCanvasAppAssemblyFeaturePackInstallOptions(
    assemblyInput,
    featurePackManifests,
  )

  return Object.freeze({
    featurePackStates: snapshotCanvasAppFeaturePackRuntimeStateInputs(
      getCanvasAppResolvedFeaturePackStates(
        featurePackManifests.map((manifest) => manifest.id),
        installOptions,
      ).map((state) => ({
        id: state.id,
        status: state.status,
      })),
    ),
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyFeaturePackStates(
  model: CanvasAppFeaturePackMarketplaceAssemblyModel,
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  return snapshotCanvasAppFeaturePackRuntimeStateInputs(
    model.assemblyInput.featurePackStates ?? [],
  )
}

export function getCanvasAppAssemblyFeaturePackManifests(
  input: CanvasAppFeaturePackAssemblyInput,
): readonly CanvasAppFeaturePackManifest[] {
  const baseFeaturePackManifests =
    input.featurePackManifests ?? DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS
  const additionalFeaturePackManifests =
    input.additionalFeaturePackManifests ?? []

  if (additionalFeaturePackManifests.length === 0) {
    return baseFeaturePackManifests
  }

  return Object.freeze([
    ...baseFeaturePackManifests,
    ...additionalFeaturePackManifests,
  ])
}

export function getCanvasAppAssemblyFeaturePackInstallOptions(
  input: CanvasAppFeaturePackAssemblyInput,
  featurePackManifests: readonly CanvasAppFeaturePackManifest[],
): CanvasAppFeaturePackInstallOptions {
  const profile = getCanvasAppAssemblyFeaturePackProfile(input)

  if (!profile) {
    return {
      disabledFeaturePackIds: input.disabledFeaturePackIds,
      featureFlagSettings: input.featureFlagSettings,
      featurePackStates: input.featurePackStates,
    }
  }

  return {
    featurePackStates: [
      ...getCanvasAppFeaturePackProfileRuntimeStates({
        featurePackIds: featurePackManifests.map((manifest) => manifest.id),
        profile,
      }),
      ...(input.disabledFeaturePackIds ?? []).map((id) => ({
        id,
        status: 'uninstalled' as const,
      })),
      ...getCanvasAppFeatureFlagRuntimeStateInputs(input.featureFlagSettings),
      ...(input.featurePackStates ?? []),
    ],
  }
}

export function snapshotCanvasAppFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
): readonly CanvasAppFeaturePackManifest[] {
  return Object.freeze([...manifests])
}

export function snapshotCanvasAppFeaturePackRuntimeStateInputs(
  states: readonly CanvasAppFeaturePackRuntimeStateInput[],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  return Object.freeze(states.map((state) =>
    Object.freeze({
      id: state.id,
      status: state.status,
    })
  ))
}

export function snapshotCanvasAppFeaturePackMarketplaceListings(
  listings: readonly CanvasAppFeaturePackMarketplaceListingInput[],
): readonly CanvasAppFeaturePackMarketplaceListingInput[] {
  return Object.freeze([...listings])
}

export function snapshotCanvasAppFeaturePackProfiles(
  profiles: readonly CanvasAppFeaturePackProfile[],
): readonly CanvasAppFeaturePackProfile[] {
  return Object.freeze([...profiles])
}

export function snapshotCanvasAppFeaturePackSuiteManifests(
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[],
): readonly CanvasAppFeaturePackSuiteManifest[] {
  return Object.freeze([...suiteManifests])
}

export function snapshotCanvasAppInstalledFeaturePackIds(
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...installedFeaturePackIds])
}

export function snapshotCanvasAppEnabledFeaturePackIds(
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze([...enabledFeaturePackIds])
}

export function snapshotCanvasAppFeaturePackViewRenderers(
  renderers: CanvasAppFeaturePackViewRenderers,
): CanvasAppFeaturePackViewRenderers {
  assertCanvasAppFeaturePackViewRenderers(renderers)

  return Object.freeze({ ...renderers })
}

function getCanvasAppAssemblyFeaturePackProfile(
  input: CanvasAppFeaturePackAssemblyInput,
): CanvasAppFeaturePackProfile | undefined {
  if (input.featurePackProfile && input.featurePackProfileId) {
    throw new Error(
      'Canvas app assembly accepts featurePackProfile or featurePackProfileId, not both',
    )
  }

  if (input.featurePackProfile) {
    return input.featurePackProfile
  }

  if (!input.featurePackProfileId) {
    return undefined
  }

  return getCanvasAppFeaturePackProfileById(
    input.featurePackProfiles ?? DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
    input.featurePackProfileId,
  )
}

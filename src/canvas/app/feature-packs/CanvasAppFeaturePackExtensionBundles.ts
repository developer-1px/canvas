import {
  createEmptyCanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  assertCanvasAppFeaturePacks,
  type CanvasAppFeaturePack,
} from './CanvasAppFeaturePackContracts'
import {
  getCanvasAppEnabledFeaturePackIds,
  type CanvasAppFeaturePackInstallOptions,
} from './CanvasAppFeaturePackRuntimeStates'

export function getCanvasAppInstalledFeaturePacks(
  featurePacks: readonly CanvasAppFeaturePack[],
  options: CanvasAppFeaturePackInstallOptions = {},
) {
  assertCanvasAppFeaturePacks(featurePacks)
  const enabledIds = getCanvasAppEnabledFeaturePackIdSet(
    featurePacks.map((featurePack) => featurePack.id),
    options,
  )

  return Object.freeze(
    featurePacks.filter((featurePack) => enabledIds.has(featurePack.id)),
  ) as readonly CanvasAppFeaturePack[]
}

export function createCanvasAppFeaturePackExtensionBundle(
  featurePacks: readonly CanvasAppFeaturePack[],
  options: CanvasAppFeaturePackInstallOptions = {},
) {
  return getCanvasAppInstalledFeaturePacks(featurePacks, options).reduce(
    (bundle, featurePack) =>
      mergeCanvasAppExtensionBundle({
        current: bundle,
        entries: featurePack.extensionBundle,
        owner: 'app assembly',
      }),
    createEmptyCanvasAppExtensionBundle(),
  )
}

function getCanvasAppEnabledFeaturePackIdSet(
  featurePackIds: readonly string[],
  options: CanvasAppFeaturePackInstallOptions,
) {
  return new Set(getCanvasAppEnabledFeaturePackIds(featurePackIds, options))
}

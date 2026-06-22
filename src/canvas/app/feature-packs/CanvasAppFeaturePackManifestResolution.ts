import {
  type CanvasAppFeaturePack,
  type CanvasAppFeaturePackId,
  getCanvasAppEnabledFeaturePackIds,
  getCanvasAppInstalledFeaturePackIds,
} from './CanvasAppFeaturePacks'
import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifestContracts'
import {
  type CanvasAppViewFeaturePack,
} from './CanvasAppFeaturePackViews'

export function getCanvasAppManifestExtensionFeaturePacks(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePack[] {
  return Object.freeze(
    getCanvasAppFilteredEnabledFeaturePackManifests(manifests, options)
      .flatMap((manifest) =>
        manifest.extensionFeaturePack ? [manifest.extensionFeaturePack] : [],
      ),
  )
}

export function getCanvasAppManifestViewFeaturePacks(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppViewFeaturePack[] {
  return Object.freeze(
    getCanvasAppFilteredEnabledFeaturePackManifests(manifests, options)
      .flatMap((manifest) =>
        manifest.viewFeaturePack ? [manifest.viewFeaturePack] : [],
      ),
  )
}

export function getCanvasAppInstalledFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePackManifest[] {
  assertCanvasAppFeaturePackManifests(manifests)
  const installedIds = new Set(getCanvasAppInstalledFeaturePackIds(
    getCanvasAppFeaturePackManifestIds(manifests),
    options,
  ))

  assertCanvasAppFeaturePackManifestGraph({
    manifests,
    stateIds: installedIds,
    stateLabel: 'installed',
  })

  return Object.freeze(
    manifests.filter((manifest) => installedIds.has(manifest.id)),
  )
}

export function getCanvasAppEnabledFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePackManifest[] {
  const enabledManifests = getCanvasAppFilteredEnabledFeaturePackManifests(
    manifests,
    options,
  )
  const enabledIds = new Set(enabledManifests.map((manifest) => manifest.id))

  assertCanvasAppFeaturePackManifestGraph({
    manifests,
    stateIds: enabledIds,
    stateLabel: 'enabled',
  })

  return enabledManifests
}

export function getCanvasAppInstalledFeaturePackManifestIds(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    getCanvasAppInstalledFeaturePackManifests(manifests, options)
      .map((manifest) => manifest.id),
  )
}

export function getCanvasAppEnabledFeaturePackManifestIds(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    getCanvasAppEnabledFeaturePackManifests(manifests, options)
      .map((manifest) => manifest.id),
  )
}

function getCanvasAppFilteredEnabledFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePackManifest[] {
  assertCanvasAppFeaturePackManifests(manifests)
  const enabledIds = new Set(getCanvasAppEnabledFeaturePackIds(
    getCanvasAppFeaturePackManifestIds(manifests),
    options,
  ))

  return Object.freeze(
    manifests.filter((manifest) => enabledIds.has(manifest.id)),
  )
}

function getCanvasAppFeaturePackManifestIds(
  manifests: readonly CanvasAppFeaturePackManifest[],
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(manifests.map((manifest) => manifest.id))
}

function assertCanvasAppFeaturePackManifestGraph({
  manifests,
  stateIds,
  stateLabel,
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  stateIds: ReadonlySet<CanvasAppFeaturePackId>
  stateLabel: 'enabled' | 'installed'
}) {
  const knownIds = new Set(
    manifests.flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
  const satisfiedIds = new Set(
    manifests
      .filter((manifest) => stateIds.has(manifest.id))
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )

  for (const manifest of manifests) {
    if (!stateIds.has(manifest.id)) {
      continue
    }

    for (const requiredId of manifest.requires) {
      if (!knownIds.has(requiredId)) {
        throw new Error(
          `Feature pack ${manifest.id} requires unknown pack: ${requiredId}`,
        )
      }

      if (!satisfiedIds.has(requiredId)) {
        throw new Error(
          `Feature pack ${manifest.id} requires ${stateLabel} pack: ${requiredId}`,
        )
      }
    }

    for (const conflictId of manifest.conflicts) {
      if (satisfiedIds.has(conflictId)) {
        throw new Error(
          `Feature pack ${manifest.id} conflicts with ${stateLabel} pack: ${conflictId}`,
        )
      }
    }
  }
}

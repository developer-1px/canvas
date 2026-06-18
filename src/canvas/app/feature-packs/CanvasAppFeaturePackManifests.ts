import {
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  assertCanvasAppFeaturePack,
  type CanvasAppFeaturePack,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackInstallOptions,
} from './CanvasAppFeaturePacks'
import {
  assertCanvasAppViewFeaturePack,
  type CanvasAppViewFeaturePack,
} from './CanvasAppFeaturePackViews'

export type CanvasAppFeaturePackManifest<TRuntimeFeaturePacks = unknown> =
  Readonly<{
    extensionFeaturePack?: CanvasAppFeaturePack
    id: CanvasAppFeaturePackId
    label: string
    runtimeFeaturePacks?: TRuntimeFeaturePacks
    viewFeaturePack?: CanvasAppViewFeaturePack
  }>

export type CanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks = unknown> =
  Readonly<{
    extensionFeaturePack?: CanvasAppFeaturePack
    id: CanvasAppFeaturePackId
    label: string
    runtimeFeaturePacks?: TRuntimeFeaturePacks
    viewFeaturePack?: CanvasAppViewFeaturePack
  }>

export type CanvasAppFeaturePackManifestInstallOptions =
  CanvasAppFeaturePackInstallOptions

export function createCanvasAppFeaturePackManifest<TRuntimeFeaturePacks>(
  input: CanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks>,
): CanvasAppFeaturePackManifest<TRuntimeFeaturePacks> {
  assertCanvasAppFeaturePackManifestInput(input)

  return Object.freeze({
    extensionFeaturePack: input.extensionFeaturePack,
    id: input.id,
    label: input.label,
    runtimeFeaturePacks: input.runtimeFeaturePacks,
    viewFeaturePack: input.viewFeaturePack,
  })
}

export function getCanvasAppManifestExtensionFeaturePacks(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePack[] {
  return Object.freeze(
    getCanvasAppInstalledFeaturePackManifests(manifests, options).flatMap((manifest) =>
      manifest.extensionFeaturePack ? [manifest.extensionFeaturePack] : [],
    ),
  )
}

export function getCanvasAppManifestViewFeaturePacks(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppViewFeaturePack[] {
  return Object.freeze(
    getCanvasAppInstalledFeaturePackManifests(manifests, options).flatMap((manifest) =>
      manifest.viewFeaturePack ? [manifest.viewFeaturePack] : [],
    ),
  )
}

export function getCanvasAppInstalledFeaturePackManifests(
  manifests: readonly CanvasAppFeaturePackManifest[],
  options: CanvasAppFeaturePackManifestInstallOptions = {},
): readonly CanvasAppFeaturePackManifest[] {
  assertCanvasAppFeaturePackManifests(manifests)
  const disabledIds = getCanvasAppDisabledFeaturePackManifestIdSet(
    options.disabledFeaturePackIds ?? [],
  )

  return Object.freeze(
    manifests.filter((manifest) => !disabledIds.has(manifest.id)),
  )
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

export function assertCanvasAppFeaturePackManifests(
  manifests: unknown,
): asserts manifests is readonly CanvasAppFeaturePackManifest[] {
  if (!Array.isArray(manifests)) {
    throw new Error('Expected feature pack manifests array')
  }

  const ids = new Set<string>()

  for (const manifest of manifests) {
    assertCanvasAppFeaturePackManifest(manifest)

    if (ids.has(manifest.id)) {
      throw new Error(`Duplicate canvas app feature pack manifest: ${manifest.id}`)
    }

    ids.add(manifest.id)
  }
}

export function assertCanvasAppFeaturePackManifest(
  manifest: unknown,
): asserts manifest is CanvasAppFeaturePackManifest {
  assertCanvasAppDescriptorObject(manifest, 'feature pack manifest')
  assertCanvasAppExtensionId({
    id: manifest.id,
    label: 'feature pack manifest',
  })
  const manifestId = manifest.id as CanvasAppFeaturePackId
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack manifest ${manifestId}`,
    value: manifest.label,
  })

  if (manifest.extensionFeaturePack !== undefined) {
    const extensionFeaturePack = manifest.extensionFeaturePack

    assertCanvasAppFeaturePack(extensionFeaturePack)
    assertCanvasAppFeaturePackManifestContributionId({
      contributionId: extensionFeaturePack.id,
      manifestId,
      type: 'extension',
    })
  }

  if (manifest.viewFeaturePack !== undefined) {
    const viewFeaturePack = manifest.viewFeaturePack

    assertCanvasAppViewFeaturePack(viewFeaturePack)
    assertCanvasAppFeaturePackManifestContributionId({
      contributionId: viewFeaturePack.id,
      manifestId,
      type: 'view',
    })
  }
}

function assertCanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks>(
  input: CanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks>,
) {
  assertCanvasAppFeaturePackManifest(input)
}

function assertCanvasAppFeaturePackManifestContributionId({
  contributionId,
  manifestId,
  type,
}: {
  contributionId: CanvasAppFeaturePackId
  manifestId: CanvasAppFeaturePackId
  type: string
}) {
  if (contributionId !== manifestId) {
    throw new Error(
      `Feature pack manifest ${manifestId} has ${type} contribution ${contributionId}`,
    )
  }
}

function getCanvasAppDisabledFeaturePackManifestIdSet(
  disabledFeaturePackIds: readonly CanvasAppFeaturePackId[],
) {
  for (const id of disabledFeaturePackIds) {
    assertCanvasAppExtensionId({
      id,
      label: 'disabled feature pack manifest',
    })
  }

  return new Set(disabledFeaturePackIds)
}

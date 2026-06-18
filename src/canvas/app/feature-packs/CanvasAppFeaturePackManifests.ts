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
  getCanvasAppEnabledFeaturePackIds,
  getCanvasAppInstalledFeaturePackIds,
} from './CanvasAppFeaturePacks'
import {
  assertCanvasAppViewFeaturePack,
  type CanvasAppViewFeaturePack,
} from './CanvasAppFeaturePackViews'

export type CanvasAppFeaturePackManifest<TRuntimeFeaturePacks = unknown> =
  Readonly<{
    category: CanvasAppFeaturePackManifestCategory
    compatibility: CanvasAppFeaturePackManifestCompatibility
    conflicts: readonly CanvasAppFeaturePackId[]
    contributes: CanvasAppFeaturePackManifestContributions
    extensionFeaturePack?: CanvasAppFeaturePack
    id: CanvasAppFeaturePackId
    label: string
    lifecycle: CanvasAppFeaturePackManifestLifecycle
    optionalRequires: readonly CanvasAppFeaturePackId[]
    provides: readonly CanvasAppFeaturePackId[]
    requires: readonly CanvasAppFeaturePackId[]
    runtimeFeaturePacks?: TRuntimeFeaturePacks
    version: string
    viewFeaturePack?: CanvasAppViewFeaturePack
  }>

export type CanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks = unknown> =
  Readonly<{
    category?: CanvasAppFeaturePackManifestCategory
    compatibility?: CanvasAppFeaturePackManifestCompatibilityInput
    conflicts?: readonly CanvasAppFeaturePackId[]
    contributes?: CanvasAppFeaturePackManifestContributionsInput
    extensionFeaturePack?: CanvasAppFeaturePack
    id: CanvasAppFeaturePackId
    label: string
    lifecycle?: CanvasAppFeaturePackManifestLifecycleInput
    optionalRequires?: readonly CanvasAppFeaturePackId[]
    provides?: readonly CanvasAppFeaturePackId[]
    requires?: readonly CanvasAppFeaturePackId[]
    runtimeFeaturePacks?: TRuntimeFeaturePacks
    version?: string
    viewFeaturePack?: CanvasAppViewFeaturePack
  }>

export type CanvasAppFeaturePackManifestInstallOptions =
  CanvasAppFeaturePackInstallOptions

export type CanvasAppFeaturePackManifestCategory =
  | 'automation'
  | 'authoring'
  | 'collaboration'
  | 'foundation'
  | 'import-export'
  | 'inspection'
  | 'review'
  | 'suite'
  | 'view'

export type CanvasAppFeaturePackContributionSurface =
  | 'asset'
  | 'command'
  | 'document-change'
  | 'documentation'
  | 'exporter'
  | 'importer'
  | 'inspector'
  | 'item-renderer'
  | 'item-schema'
  | 'migration'
  | 'overlay'
  | 'runtime-model'
  | 'tool'
  | 'view-renderer'

export type CanvasAppFeaturePackManifestContributions = Readonly<{
  surfaces: readonly CanvasAppFeaturePackContributionSurface[]
}>

export type CanvasAppFeaturePackManifestContributionsInput = Readonly<{
  surfaces?: readonly CanvasAppFeaturePackContributionSurface[]
}>

export type CanvasAppFeaturePackManifestLifecycle = Readonly<{
  hotReloadable: boolean
  installable: boolean
  partialUpdate: readonly CanvasAppFeaturePackContributionSurface[]
  runtimeToggleable: boolean
  uninstallable: boolean
}>

export type CanvasAppFeaturePackManifestLifecycleInput = Readonly<{
  hotReloadable?: boolean
  installable?: boolean
  partialUpdate?: readonly CanvasAppFeaturePackContributionSurface[]
  runtimeToggleable?: boolean
  uninstallable?: boolean
}>

export type CanvasAppFeaturePackManifestCompatibility = Readonly<{
  documentSchemaVersion?: string
  engineVersion: string
  featureStateVersion?: string
}>

export type CanvasAppFeaturePackManifestCompatibilityInput = Readonly<{
  documentSchemaVersion?: string
  engineVersion?: string
  featureStateVersion?: string
}>

const CANVAS_APP_FEATURE_PACK_DEFAULT_CATEGORY =
  'view' satisfies CanvasAppFeaturePackManifestCategory
const CANVAS_APP_FEATURE_PACK_DEFAULT_VERSION = '0.1.0'
const CANVAS_APP_FEATURE_PACK_DEFAULT_ENGINE_VERSION = '0.1.x'
const CANVAS_APP_FEATURE_PACK_CONTRIBUTION_SURFACES =
  Object.freeze([
    'asset',
    'command',
    'document-change',
    'documentation',
    'exporter',
    'importer',
    'inspector',
    'item-renderer',
    'item-schema',
    'migration',
    'overlay',
    'runtime-model',
    'tool',
    'view-renderer',
  ] as const)
const CANVAS_APP_FEATURE_PACK_CATEGORIES =
  Object.freeze([
    'automation',
    'authoring',
    'collaboration',
    'foundation',
    'import-export',
    'inspection',
    'review',
    'suite',
    'view',
  ] as const)

export function createCanvasAppFeaturePackManifest<TRuntimeFeaturePacks>(
  input: CanvasAppFeaturePackManifestInput<TRuntimeFeaturePacks>,
): CanvasAppFeaturePackManifest<TRuntimeFeaturePacks> {
  assertCanvasAppFeaturePackManifestInput(input)

  return Object.freeze({
    category: input.category ?? CANVAS_APP_FEATURE_PACK_DEFAULT_CATEGORY,
    compatibility: createCanvasAppFeaturePackManifestCompatibility(
      input.compatibility,
    ),
    conflicts: snapshotCanvasAppFeaturePackManifestIds(
      input.conflicts ?? [],
      'feature pack manifest conflicts',
    ),
    contributes: createCanvasAppFeaturePackManifestContributions(
      input.contributes,
    ),
    extensionFeaturePack: input.extensionFeaturePack,
    id: input.id,
    label: input.label,
    lifecycle: createCanvasAppFeaturePackManifestLifecycle(input.lifecycle),
    optionalRequires: snapshotCanvasAppFeaturePackManifestIds(
      input.optionalRequires ?? [],
      'feature pack manifest optional requires',
    ),
    provides: snapshotCanvasAppFeaturePackManifestIds(
      input.provides ?? [],
      'feature pack manifest provides',
    ),
    requires: snapshotCanvasAppFeaturePackManifestIds(
      input.requires ?? [],
      'feature pack manifest requires',
    ),
    runtimeFeaturePacks: input.runtimeFeaturePacks,
    version: input.version ?? CANVAS_APP_FEATURE_PACK_DEFAULT_VERSION,
    viewFeaturePack: input.viewFeaturePack,
  })
}

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
  assertCanvasAppDescriptorStringField({
    field: 'version',
    owner: `feature pack manifest ${manifestId}`,
    value: manifest.version,
  })
  assertCanvasAppFeaturePackManifestCategory({
    category: manifest.category,
    owner: `feature pack manifest ${manifestId}`,
  })
  assertCanvasAppFeaturePackManifestContributions({
    contributions: manifest.contributes,
    owner: `feature pack manifest ${manifestId}`,
  })
  assertCanvasAppFeaturePackManifestLifecycle({
    lifecycle: manifest.lifecycle,
    owner: `feature pack manifest ${manifestId}`,
  })
  assertCanvasAppFeaturePackManifestCompatibility({
    compatibility: manifest.compatibility,
    owner: `feature pack manifest ${manifestId}`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: manifest.requires,
    owner: `feature pack manifest ${manifestId} requires`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: manifest.optionalRequires,
    owner: `feature pack manifest ${manifestId} optional requires`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: manifest.conflicts,
    owner: `feature pack manifest ${manifestId} conflicts`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: manifest.provides,
    owner: `feature pack manifest ${manifestId} provides`,
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
  assertCanvasAppDescriptorObject(input, 'feature pack manifest input')
  assertCanvasAppExtensionId({
    id: input.id,
    label: 'feature pack manifest',
  })
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack manifest ${input.id}`,
    value: input.label,
  })

  if (input.version !== undefined) {
    assertCanvasAppDescriptorStringField({
      field: 'version',
      owner: `feature pack manifest ${input.id}`,
      value: input.version,
    })
  }

  if (input.category !== undefined) {
    assertCanvasAppFeaturePackManifestCategory({
      category: input.category,
      owner: `feature pack manifest ${input.id}`,
    })
  }

  assertCanvasAppFeaturePackManifestContributions({
    contributions: createCanvasAppFeaturePackManifestContributions(
      input.contributes,
    ),
    owner: `feature pack manifest ${input.id}`,
  })
  assertCanvasAppFeaturePackManifestLifecycle({
    lifecycle: createCanvasAppFeaturePackManifestLifecycle(input.lifecycle),
    owner: `feature pack manifest ${input.id}`,
  })
  assertCanvasAppFeaturePackManifestCompatibility({
    compatibility: createCanvasAppFeaturePackManifestCompatibility(
      input.compatibility,
    ),
    owner: `feature pack manifest ${input.id}`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: input.requires ?? [],
    owner: `feature pack manifest ${input.id} requires`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: input.optionalRequires ?? [],
    owner: `feature pack manifest ${input.id} optional requires`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: input.conflicts ?? [],
    owner: `feature pack manifest ${input.id} conflicts`,
  })
  assertCanvasAppFeaturePackManifestIdList({
    ids: input.provides ?? [],
    owner: `feature pack manifest ${input.id} provides`,
  })

  if (input.extensionFeaturePack !== undefined) {
    assertCanvasAppFeaturePack(input.extensionFeaturePack)
    assertCanvasAppFeaturePackManifestContributionId({
      contributionId: input.extensionFeaturePack.id,
      manifestId: input.id,
      type: 'extension',
    })
  }

  if (input.viewFeaturePack !== undefined) {
    assertCanvasAppViewFeaturePack(input.viewFeaturePack)
    assertCanvasAppFeaturePackManifestContributionId({
      contributionId: input.viewFeaturePack.id,
      manifestId: input.id,
      type: 'view',
    })
  }
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
  const manifestIds = new Set(
    manifests.map((manifest) => manifest.id),
  )

  for (const manifest of manifests) {
    if (!stateIds.has(manifest.id)) {
      continue
    }

    for (const requiredId of manifest.requires) {
      if (!manifestIds.has(requiredId)) {
        throw new Error(
          `Feature pack ${manifest.id} requires unknown pack: ${requiredId}`,
        )
      }

      if (!stateIds.has(requiredId)) {
        throw new Error(
          `Feature pack ${manifest.id} requires ${stateLabel} pack: ${requiredId}`,
        )
      }
    }

    for (const conflictId of manifest.conflicts) {
      if (stateIds.has(conflictId)) {
        throw new Error(
          `Feature pack ${manifest.id} conflicts with ${stateLabel} pack: ${conflictId}`,
        )
      }
    }
  }
}

function createCanvasAppFeaturePackManifestContributions(
  input?: CanvasAppFeaturePackManifestContributionsInput,
): CanvasAppFeaturePackManifestContributions {
  return Object.freeze({
    surfaces: snapshotCanvasAppFeaturePackContributionSurfaces(
      input?.surfaces ?? [],
    ),
  })
}

function createCanvasAppFeaturePackManifestLifecycle(
  input?: CanvasAppFeaturePackManifestLifecycleInput,
): CanvasAppFeaturePackManifestLifecycle {
  return Object.freeze({
    hotReloadable: input?.hotReloadable ?? false,
    installable: input?.installable ?? true,
    partialUpdate: snapshotCanvasAppFeaturePackContributionSurfaces(
      input?.partialUpdate ?? [],
    ),
    runtimeToggleable: input?.runtimeToggleable ?? false,
    uninstallable: input?.uninstallable ?? true,
  })
}

function createCanvasAppFeaturePackManifestCompatibility(
  input?: CanvasAppFeaturePackManifestCompatibilityInput,
): CanvasAppFeaturePackManifestCompatibility {
  const compatibility = {
    documentSchemaVersion: input?.documentSchemaVersion,
    engineVersion:
      input?.engineVersion ?? CANVAS_APP_FEATURE_PACK_DEFAULT_ENGINE_VERSION,
    featureStateVersion: input?.featureStateVersion,
  }

  assertCanvasAppFeaturePackManifestCompatibility({
    compatibility,
    owner: 'feature pack manifest compatibility',
  })

  return Object.freeze(compatibility)
}

function snapshotCanvasAppFeaturePackManifestIds(
  ids: readonly CanvasAppFeaturePackId[],
  owner: string,
): readonly CanvasAppFeaturePackId[] {
  assertCanvasAppFeaturePackManifestIdList({ ids, owner })

  return Object.freeze([...ids])
}

function assertCanvasAppFeaturePackManifestIdList({
  ids,
  owner,
}: {
  ids: unknown
  owner: string
}) {
  if (!Array.isArray(ids)) {
    throw new Error(`Expected ${owner} array`)
  }

  const seen = new Set<string>()

  for (const id of ids) {
    assertCanvasAppExtensionId({
      id,
      label: owner,
    })

    if (seen.has(id)) {
      throw new Error(`Duplicate ${owner}: ${id}`)
    }

    seen.add(id)
  }
}

function assertCanvasAppFeaturePackManifestCategory({
  category,
  owner,
}: {
  category: unknown
  owner: string
}) {
  if (
    typeof category !== 'string' ||
    !CANVAS_APP_FEATURE_PACK_CATEGORIES.includes(
      category as CanvasAppFeaturePackManifestCategory,
    )
  ) {
    throw new Error(`Invalid ${owner} category: ${String(category)}`)
  }
}

function assertCanvasAppFeaturePackManifestContributions({
  contributions,
  owner,
}: {
  contributions: unknown
  owner: string
}) {
  assertCanvasAppDescriptorObject(contributions, `${owner} contributes`)
  const surfaces = contributions.surfaces

  if (!Array.isArray(surfaces)) {
    throw new Error(`Expected ${owner} contribution surfaces array`)
  }

  snapshotCanvasAppFeaturePackContributionSurfaces(surfaces)
}

function assertCanvasAppFeaturePackManifestLifecycle({
  lifecycle,
  owner,
}: {
  lifecycle: unknown
  owner: string
}) {
  assertCanvasAppDescriptorObject(lifecycle, `${owner} lifecycle`)

  for (const field of [
    'hotReloadable',
    'installable',
    'runtimeToggleable',
    'uninstallable',
  ] as const) {
    if (typeof lifecycle[field] !== 'boolean') {
      throw new Error(`Expected ${owner} lifecycle ${field} boolean`)
    }
  }

  if (!Array.isArray(lifecycle.partialUpdate)) {
    throw new Error(`Expected ${owner} lifecycle partialUpdate array`)
  }

  snapshotCanvasAppFeaturePackContributionSurfaces(lifecycle.partialUpdate)
}

function assertCanvasAppFeaturePackManifestCompatibility({
  compatibility,
  owner,
}: {
  compatibility: unknown
  owner: string
}) {
  assertCanvasAppDescriptorObject(compatibility, `${owner} compatibility`)
  assertCanvasAppDescriptorStringField({
    field: 'engineVersion',
    owner: `${owner} compatibility`,
    value: compatibility.engineVersion,
  })

  for (const field of [
    'documentSchemaVersion',
    'featureStateVersion',
  ] as const) {
    if (
      compatibility[field] !== undefined &&
      typeof compatibility[field] !== 'string'
    ) {
      throw new Error(`Expected ${owner} compatibility ${field} string`)
    }
  }
}

function snapshotCanvasAppFeaturePackContributionSurfaces(
  surfaces: readonly unknown[],
): readonly CanvasAppFeaturePackContributionSurface[] {
  if (!Array.isArray(surfaces)) {
    throw new Error('Expected feature pack contribution surfaces array')
  }

  const seen = new Set<string>()

  for (const surface of surfaces) {
    if (
      typeof surface !== 'string' ||
      !CANVAS_APP_FEATURE_PACK_CONTRIBUTION_SURFACES.includes(
        surface as CanvasAppFeaturePackContributionSurface,
      )
    ) {
      throw new Error(`Invalid feature pack contribution surface: ${String(surface)}`)
    }

    if (seen.has(surface)) {
      throw new Error(`Duplicate feature pack contribution surface: ${surface}`)
    }

    seen.add(surface)
  }

  return Object.freeze([...surfaces]) as readonly CanvasAppFeaturePackContributionSurface[]
}

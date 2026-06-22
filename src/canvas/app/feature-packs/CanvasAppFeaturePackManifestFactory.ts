import {
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import { assertCanvasAppFeaturePack } from './CanvasAppFeaturePacks'
import { assertCanvasAppViewFeaturePack } from './CanvasAppFeaturePackViews'
import {
  assertCanvasAppFeaturePackManifestCategory,
  assertCanvasAppFeaturePackManifestCompatibility,
  assertCanvasAppFeaturePackManifestContributionId,
  assertCanvasAppFeaturePackManifestContributions,
  assertCanvasAppFeaturePackManifestIdList,
  assertCanvasAppFeaturePackManifestLifecycle,
  assertCanvasAppFeaturePackManifestPackage,
  snapshotCanvasAppFeaturePackContributionSurfaces,
  snapshotCanvasAppFeaturePackManifestIds,
} from './CanvasAppFeaturePackManifestAssertions'
import {
  CANVAS_APP_FEATURE_PACK_DEFAULT_CATEGORY,
  CANVAS_APP_FEATURE_PACK_DEFAULT_ENGINE_VERSION,
  CANVAS_APP_FEATURE_PACK_DEFAULT_PACKAGE_NAME,
  CANVAS_APP_FEATURE_PACK_DEFAULT_VERSION,
} from './CanvasAppFeaturePackManifestConstants'
import type {
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestCompatibility,
  CanvasAppFeaturePackManifestCompatibilityInput,
  CanvasAppFeaturePackManifestContributions,
  CanvasAppFeaturePackManifestContributionsInput,
  CanvasAppFeaturePackManifestInput,
  CanvasAppFeaturePackManifestLifecycle,
  CanvasAppFeaturePackManifestLifecycleInput,
  CanvasAppFeaturePackManifestPackage,
  CanvasAppFeaturePackManifestPackageInput,
} from './CanvasAppFeaturePackManifestTypes'

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
    package: createCanvasAppFeaturePackManifestPackage(
      input.package,
      `feature pack manifest ${input.id}`,
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
  assertCanvasAppFeaturePackManifestPackage({
    owner: `feature pack manifest ${input.id}`,
    packageInfo: createCanvasAppFeaturePackManifestPackage(
      input.package,
      `feature pack manifest ${input.id}`,
    ),
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
    orphanedDataScopeIds: snapshotCanvasAppFeaturePackManifestIds(
      input?.orphanedDataScopeIds ?? [],
      'feature pack manifest orphaned data scope',
    ),
    orphanedDataPolicy: input?.orphanedDataPolicy ?? 'preserve',
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

function createCanvasAppFeaturePackManifestPackage(
  input?: CanvasAppFeaturePackManifestPackageInput,
  owner = 'feature pack manifest package',
): CanvasAppFeaturePackManifestPackage {
  const packageInfo = {
    name: input?.name ?? CANVAS_APP_FEATURE_PACK_DEFAULT_PACKAGE_NAME,
    subpath: input?.subpath,
  }

  assertCanvasAppFeaturePackManifestPackage({
    owner,
    packageInfo,
  })

  return Object.freeze(packageInfo)
}

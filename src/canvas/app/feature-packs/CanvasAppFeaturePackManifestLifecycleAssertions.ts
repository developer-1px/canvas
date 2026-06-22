import {
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  CANVAS_APP_FEATURE_PACK_ORPHANED_DATA_POLICIES,
} from './CanvasAppFeaturePackManifestConstants'
import type {
  CanvasAppFeaturePackManifestOrphanedDataPolicy,
} from './CanvasAppFeaturePackManifestTypes'
import {
  snapshotCanvasAppFeaturePackContributionSurfaces,
} from './CanvasAppFeaturePackContributionSurfaceAssertions'
import {
  snapshotCanvasAppFeaturePackManifestIds,
} from './CanvasAppFeaturePackManifestIdAssertions'

export function assertCanvasAppFeaturePackManifestLifecycle({
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

  if (!Array.isArray(lifecycle.orphanedDataScopeIds)) {
    throw new Error(
      `Expected ${owner} lifecycle orphanedDataScopeIds array`,
    )
  }

  snapshotCanvasAppFeaturePackManifestIds(
    lifecycle.orphanedDataScopeIds,
    `${owner} lifecycle orphaned data scope`,
  )
  snapshotCanvasAppFeaturePackContributionSurfaces(lifecycle.partialUpdate)
  assertCanvasAppFeaturePackManifestOrphanedDataPolicy({
    owner,
    policy: lifecycle.orphanedDataPolicy,
  })
}

function assertCanvasAppFeaturePackManifestOrphanedDataPolicy({
  owner,
  policy,
}: {
  owner: string
  policy: unknown
}) {
  if (
    typeof policy !== 'string' ||
    !CANVAS_APP_FEATURE_PACK_ORPHANED_DATA_POLICIES.includes(
      policy as CanvasAppFeaturePackManifestOrphanedDataPolicy,
    )
  ) {
    throw new Error(
      `Invalid ${owner} lifecycle orphanedDataPolicy: ${String(policy)}`,
    )
  }
}

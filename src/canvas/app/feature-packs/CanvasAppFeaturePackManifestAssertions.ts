import {
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import { assertCanvasAppFeaturePack } from './CanvasAppFeaturePacks'
import { assertCanvasAppViewFeaturePack } from './CanvasAppFeaturePackViews'
import {
  assertCanvasAppFeaturePackManifestContributions,
} from './CanvasAppFeaturePackContributionSurfaceAssertions'
import {
  assertCanvasAppFeaturePackManifestCategory,
  assertCanvasAppFeaturePackManifestCompatibility,
  assertCanvasAppFeaturePackManifestPackage,
} from './CanvasAppFeaturePackManifestFieldAssertions'
import {
  assertCanvasAppFeaturePackManifestContributionId,
  assertCanvasAppFeaturePackManifestIdList,
} from './CanvasAppFeaturePackManifestIdAssertions'
import {
  assertCanvasAppFeaturePackManifestLifecycle,
} from './CanvasAppFeaturePackManifestLifecycleAssertions'
import type {
  CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifestTypes'
import type { CanvasAppFeaturePackId } from './CanvasAppFeaturePacks'

export {
  assertCanvasAppFeaturePackManifestContributions,
  snapshotCanvasAppFeaturePackContributionSurfaces,
} from './CanvasAppFeaturePackContributionSurfaceAssertions'
export {
  assertCanvasAppFeaturePackManifestCategory,
  assertCanvasAppFeaturePackManifestCompatibility,
  assertCanvasAppFeaturePackManifestPackage,
} from './CanvasAppFeaturePackManifestFieldAssertions'
export {
  assertCanvasAppFeaturePackManifestContributionId,
  assertCanvasAppFeaturePackManifestIdList,
  snapshotCanvasAppFeaturePackManifestIds,
} from './CanvasAppFeaturePackManifestIdAssertions'
export {
  assertCanvasAppFeaturePackManifestLifecycle,
} from './CanvasAppFeaturePackManifestLifecycleAssertions'

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
  assertCanvasAppFeaturePackManifestPackage({
    owner: `feature pack manifest ${manifestId}`,
    packageInfo: manifest.package,
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

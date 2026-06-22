import type {
  CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackProfileMarketplaceContext,
  CanvasAppFeaturePackProfileMarketplaceUnknownPackReason,
} from './CanvasAppFeaturePackProfileActionContracts'

export function getCanvasAppFeaturePackProfileMarketplaceUnknownPackReasons(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): readonly CanvasAppFeaturePackProfileMarketplaceUnknownPackReason[] {
  return Object.freeze(
    getCanvasAppFeaturePackProfileMarketplaceMissingFeaturePackIds({
      manifestById: context.manifestById,
      profile: context.profile,
    }).map((featurePackId) =>
      Object.freeze({
        featurePackId,
        kind: 'unknown-profile-pack',
        profileId: context.profile.id,
      }) satisfies CanvasAppFeaturePackProfileMarketplaceUnknownPackReason,
    ),
  )
}

export function getCanvasAppFeaturePackProfileMarketplaceMissingFeaturePackIds({
  manifestById,
  profile,
}: {
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  profile: CanvasAppFeaturePackProfile
}): readonly CanvasAppFeaturePackId[] {
  const missingIds: CanvasAppFeaturePackId[] = []
  const seenIds = new Set<CanvasAppFeaturePackId>()

  for (const id of [
    ...profile.installedFeaturePackIds,
    ...profile.enabledFeaturePackIds,
  ]) {
    if (manifestById.has(id) || seenIds.has(id)) {
      continue
    }

    seenIds.add(id)
    missingIds.push(id)
  }

  return Object.freeze(missingIds)
}

import type { CanvasAppFeaturePackMarketplaceTarget } from '../feature-packs'

export function snapshotCanvasAppAssemblySourceFeaturePackMarketplaceTarget(
  target: CanvasAppFeaturePackMarketplaceTarget,
): CanvasAppFeaturePackMarketplaceTarget {
  if (target.kind === 'pack') {
    return Object.freeze({
      featurePackId: target.featurePackId,
      kind: 'pack',
    })
  }

  if (target.kind === 'profile') {
    return Object.freeze({
      kind: 'profile',
      profileId: target.profileId,
    })
  }

  return Object.freeze({
    kind: 'suite',
    suiteId: target.suiteId,
  })
}

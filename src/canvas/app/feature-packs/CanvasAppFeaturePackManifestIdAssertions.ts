import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import type { CanvasAppFeaturePackId } from './CanvasAppFeaturePacks'

export function assertCanvasAppFeaturePackManifestContributionId({
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

export function snapshotCanvasAppFeaturePackManifestIds(
  ids: readonly CanvasAppFeaturePackId[],
  owner: string,
): readonly CanvasAppFeaturePackId[] {
  assertCanvasAppFeaturePackManifestIdList({ ids, owner })

  return Object.freeze([...ids])
}

export function assertCanvasAppFeaturePackManifestIdList({
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

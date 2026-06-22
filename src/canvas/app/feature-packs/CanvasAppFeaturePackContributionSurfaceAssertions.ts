import {
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  CANVAS_APP_FEATURE_PACK_CONTRIBUTION_SURFACES,
} from './CanvasAppFeaturePackManifestConstants'
import type {
  CanvasAppFeaturePackContributionSurface,
} from './CanvasAppFeaturePackManifestTypes'

export function assertCanvasAppFeaturePackManifestContributions({
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

export function snapshotCanvasAppFeaturePackContributionSurfaces(
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

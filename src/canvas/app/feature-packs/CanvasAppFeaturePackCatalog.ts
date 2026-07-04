import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
} from './CanvasAppDefaultFeaturePackManifests'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

const CANVAS_APP_FEATURE_PACK_CATALOG =
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS
const CANVAS_APP_FEATURE_PACK_CATALOG_BY_ID = new Map(
  CANVAS_APP_FEATURE_PACK_CATALOG.map((manifest) => [manifest.id, manifest]),
)

export function getCanvasAppFeaturePackCatalog():
  readonly CanvasAppFeaturePackManifest[] {
  return CANVAS_APP_FEATURE_PACK_CATALOG
}

export function resolveCanvasAppFeaturePacks(
  ids: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackManifest[] {
  assertCanvasAppFeaturePackIds(ids)

  const seenIds = new Set<CanvasAppFeaturePackId>()

  return Object.freeze(
    ids.map((id) => {
      if (seenIds.has(id)) {
        throw new Error(`Duplicate canvas app feature pack: ${id}`)
      }

      seenIds.add(id)

      const manifest = CANVAS_APP_FEATURE_PACK_CATALOG_BY_ID.get(id)

      if (manifest === undefined) {
        throw new Error(`Unknown canvas app feature pack: ${id}`)
      }

      return manifest
    }),
  )
}

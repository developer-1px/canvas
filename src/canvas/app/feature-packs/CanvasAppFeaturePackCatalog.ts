import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
} from './CanvasAppDefaultFeaturePackManifests'
import {
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
} from './board-io'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

const CANVAS_APP_FEATURE_PACK_CATALOG = Object.freeze([
  ...DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
]) satisfies readonly CanvasAppFeaturePackManifest[]
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

import type {
  CanvasAppFeaturePackManifest,
  CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackRuntimeState,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackInstallPlanGraph = Readonly<{
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
  providersById: ReadonlyMap<
    CanvasAppFeaturePackId,
    readonly CanvasAppFeaturePackManifest[]
  >
  stateById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackRuntimeState>
}>

export function createCanvasAppFeaturePackInstallPlanGraph({
  manifests,
  options,
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackInstallPlanGraph {
  const states = getCanvasAppResolvedFeaturePackStates(
    manifests.map((manifest) => manifest.id),
    options,
  )
  const manifestById = new Map(manifests.map((manifest) => [
    manifest.id,
    manifest,
  ]))
  const providersById = new Map<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackManifest[]
  >()

  for (const manifest of manifests) {
    for (const providedId of manifest.provides) {
      providersById.set(providedId, [
        ...(providersById.get(providedId) ?? []),
        manifest,
      ])
    }
  }

  return Object.freeze({
    manifestById,
    manifests,
    providersById,
    stateById: new Map(states.map((state) => [state.id, state])),
  })
}

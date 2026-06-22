import type {
  CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackRuntimeState,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackStateTransitionPlanInput,
} from './CanvasAppFeaturePackStateTransitionPlanContracts'

export type CanvasAppFeaturePackStateTransitionContext = Readonly<{
  currentStateById: ReadonlyMap<
    CanvasAppFeaturePackId,
    CanvasAppFeaturePackRuntimeState
  >
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  manifestById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackManifest>
  manifests: readonly CanvasAppFeaturePackManifest[]
}>

export function createCanvasAppFeaturePackStateTransitionContext(
  input: CanvasAppFeaturePackStateTransitionPlanInput,
): CanvasAppFeaturePackStateTransitionContext {
  const currentStates = getCanvasAppResolvedFeaturePackStates(
    input.manifests.map((manifest) => manifest.id),
    input.options,
  )

  return Object.freeze({
    currentStateById: new Map(currentStates.map((state) => [state.id, state])),
    currentStates,
    manifestById: new Map(input.manifests.map((manifest) => [
      manifest.id,
      manifest,
    ])),
    manifests: input.manifests,
  })
}

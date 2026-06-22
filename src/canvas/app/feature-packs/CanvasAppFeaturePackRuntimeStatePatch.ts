import {
  assertCanvasAppArray,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppFeaturePackIds,
} from './CanvasAppFeaturePackContracts'
import {
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePackResolvedRuntimeStates'
import {
  getCanvasAppFeaturePackRuntimeStateInputs,
} from './CanvasAppFeaturePackRuntimeStateFactory'
import type {
  CanvasAppFeaturePackRuntimeState,
  CanvasAppFeaturePackRuntimeStatePatch,
  CanvasAppFeaturePackRuntimeStatePatchChange,
  CanvasAppFeaturePackRuntimeStatePatchInput,
} from './CanvasAppFeaturePackRuntimeStateContracts'

export function applyCanvasAppFeaturePackRuntimeStatePatch(
  input: CanvasAppFeaturePackRuntimeStatePatchInput,
): CanvasAppFeaturePackRuntimeStatePatch {
  assertCanvasAppFeaturePackIds(input.featurePackIds)
  assertCanvasAppArray(
    input.featurePackStates,
    'feature pack runtime state patch states',
  )

  const currentStates = getCanvasAppResolvedFeaturePackStates(
    input.featurePackIds,
    input.options,
  )
  const nextStates = getCanvasAppResolvedFeaturePackStates(
    input.featurePackIds,
    {
      featurePackStates: [
        ...getCanvasAppFeaturePackRuntimeStateInputs(currentStates),
        ...input.featurePackStates,
      ],
    },
  )
  const featurePackStates =
    getCanvasAppFeaturePackRuntimeStateInputs(nextStates)
  const stateChanges = getCanvasAppFeaturePackRuntimeStatePatchChanges({
    currentStates,
    nextStates,
  })

  return Object.freeze({
    changedFeaturePackIds: Object.freeze(stateChanges.map((change) => change.id)),
    featurePackStates,
    options: Object.freeze({
      featurePackStates,
    }),
    stateChanges,
  })
}

function getCanvasAppFeaturePackRuntimeStatePatchChanges({
  currentStates,
  nextStates,
}: {
  currentStates: readonly CanvasAppFeaturePackRuntimeState[]
  nextStates: readonly CanvasAppFeaturePackRuntimeState[]
}): readonly CanvasAppFeaturePackRuntimeStatePatchChange[] {
  const currentStateById = new Map(
    currentStates.map((state) => [state.id, state]),
  )

  return Object.freeze(nextStates.flatMap((nextState) => {
    const currentState = currentStateById.get(nextState.id)

    if (
      !currentState ||
      (
        currentState.enabled === nextState.enabled &&
        currentState.installed === nextState.installed &&
        currentState.status === nextState.status
      )
    ) {
      return []
    }

    return [Object.freeze({
      from: currentState,
      id: nextState.id,
      to: nextState,
    })]
  }))
}

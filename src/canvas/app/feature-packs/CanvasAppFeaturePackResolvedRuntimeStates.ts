import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePackContracts'
import {
  getCanvasAppFeatureFlagRuntimeStateInputs,
} from './CanvasAppFeatureFlagSettings'
import {
  createCanvasAppFeaturePackRuntimeState,
  createDefaultCanvasAppFeaturePackRuntimeStateMap,
} from './CanvasAppFeaturePackRuntimeStateFactory'
import type {
  CanvasAppFeaturePackInstallOptions,
  CanvasAppFeaturePackRuntimeState,
} from './CanvasAppFeaturePackRuntimeStateContracts'

export function getCanvasAppResolvedFeaturePackStates(
  featurePackIds: readonly CanvasAppFeaturePackId[],
  options: CanvasAppFeaturePackInstallOptions = {},
): readonly CanvasAppFeaturePackRuntimeState[] {
  assertCanvasAppFeaturePackIds(featurePackIds)
  const stateMap = createDefaultCanvasAppFeaturePackRuntimeStateMap(
    featurePackIds,
  )

  for (const id of options.disabledFeaturePackIds ?? []) {
    assertCanvasAppExtensionId({
      id,
      label: 'disabled feature pack',
    })
    assertCanvasAppKnownFeaturePackStateId({
      featurePackIds,
      id,
      label: 'disabled feature pack',
    })
    stateMap.set(id, createCanvasAppFeaturePackRuntimeState({
      id,
      status: 'uninstalled',
    }))
  }

  for (
    const stateInput of getCanvasAppFeatureFlagRuntimeStateInputs(
      options.featureFlagSettings,
    )
  ) {
    const state = createCanvasAppFeaturePackRuntimeState(stateInput)
    assertCanvasAppKnownFeaturePackStateId({
      featurePackIds,
      id: state.id,
      label: 'feature flag setting',
    })
    stateMap.set(state.id, state)
  }

  for (const stateInput of options.featurePackStates ?? []) {
    const state = createCanvasAppFeaturePackRuntimeState(stateInput)
    assertCanvasAppKnownFeaturePackStateId({
      featurePackIds,
      id: state.id,
      label: 'feature pack state',
    })
    stateMap.set(state.id, state)
  }

  return Object.freeze(
    featurePackIds.map((id) => {
      const state = stateMap.get(id)

      if (!state) {
        throw new Error(`Missing canvas app feature pack state: ${id}`)
      }

      return state
    }),
  )
}

export function getCanvasAppInstalledFeaturePackIds(
  featurePackIds: readonly CanvasAppFeaturePackId[],
  options: CanvasAppFeaturePackInstallOptions = {},
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    getCanvasAppResolvedFeaturePackStates(featurePackIds, options)
      .filter((state) => state.installed)
      .map((state) => state.id),
  )
}

export function getCanvasAppEnabledFeaturePackIds(
  featurePackIds: readonly CanvasAppFeaturePackId[],
  options: CanvasAppFeaturePackInstallOptions = {},
): readonly CanvasAppFeaturePackId[] {
  return Object.freeze(
    getCanvasAppResolvedFeaturePackStates(featurePackIds, options)
      .filter((state) => state.enabled)
      .map((state) => state.id),
  )
}

function assertCanvasAppKnownFeaturePackStateId({
  featurePackIds,
  id,
  label,
}: {
  featurePackIds: readonly CanvasAppFeaturePackId[]
  id: CanvasAppFeaturePackId
  label: string
}) {
  if (!featurePackIds.includes(id)) {
    throw new Error(`Unknown canvas app ${label}: ${id}`)
  }
}

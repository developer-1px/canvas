import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import type {
  CanvasAppFeaturePackRuntimeState,
  CanvasAppFeaturePackRuntimeStateInput,
  CanvasAppFeaturePackRuntimeStateStatus,
} from './CanvasAppFeaturePackRuntimeStateContracts'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePackContracts'

export function createDefaultCanvasAppFeaturePackRuntimeStateMap(
  featurePackIds: readonly CanvasAppFeaturePackId[],
) {
  return new Map(
    featurePackIds.map((id) => [
      id,
      createCanvasAppFeaturePackRuntimeState({
        id,
        status: 'enabled',
      }),
    ]),
  )
}

export function createCanvasAppFeaturePackRuntimeState(
  input: CanvasAppFeaturePackRuntimeStateInput,
): CanvasAppFeaturePackRuntimeState {
  assertCanvasAppExtensionId({
    id: input.id,
    label: 'feature pack state',
  })

  const status = input.status ?? getCanvasAppFeaturePackStatusFromFlags({
    enabled: input.enabled,
    installed: input.installed,
  })
  const statusFlags = getCanvasAppFeaturePackStatusFlags(status)
  const installed = input.installed ?? statusFlags.installed
  const enabled = input.enabled ?? statusFlags.enabled

  if (enabled && !installed) {
    throw new Error(`Feature pack state ${input.id} cannot be enabled when uninstalled`)
  }

  return Object.freeze({
    enabled,
    id: input.id,
    installed,
    status,
  })
}

export function getCanvasAppFeaturePackRuntimeStateInputs(
  states: readonly CanvasAppFeaturePackRuntimeState[],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  return Object.freeze(states.map((state) => Object.freeze({
    id: state.id,
    status: state.status,
  })))
}

function getCanvasAppFeaturePackStatusFromFlags({
  enabled,
  installed,
}: {
  enabled?: boolean
  installed?: boolean
}): CanvasAppFeaturePackRuntimeStateStatus {
  if (enabled) {
    return 'enabled'
  }

  if (installed) {
    return 'disabled'
  }

  return 'uninstalled'
}

function getCanvasAppFeaturePackStatusFlags(
  status: CanvasAppFeaturePackRuntimeStateStatus,
) {
  if (status === 'available' || status === 'uninstalled') {
    return {
      enabled: false,
      installed: false,
    }
  }

  if (
    status === 'disabled' ||
    status === 'activation-failed' ||
    status === 'installed' ||
    status === 'rollback-available'
  ) {
    return {
      enabled: false,
      installed: true,
    }
  }

  if (
    status === 'enabled' ||
    status === 'partially-updated' ||
    status === 'updating'
  ) {
    return {
      enabled: true,
      installed: true,
    }
  }

  throw new Error(`Invalid canvas app feature pack status: ${status}`)
}

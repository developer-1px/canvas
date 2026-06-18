import {
  createEmptyCanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
  snapshotCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'

export type CanvasAppFeaturePackId = string

export type CanvasAppFeaturePack = Readonly<{
  extensionBundle: CanvasAppExtensionBundle
  id: CanvasAppFeaturePackId
  label: string
}>

export type CanvasAppFeaturePackInput = Readonly<{
  extensionBundle: CanvasAppExtensionBundle
  id: CanvasAppFeaturePackId
  label: string
}>

export type CanvasAppFeaturePackInstallOptions = Readonly<{
  disabledFeaturePackIds?: readonly CanvasAppFeaturePackId[]
  featurePackStates?: readonly CanvasAppFeaturePackRuntimeStateInput[]
}>

export type CanvasAppFeaturePackRuntimeStateStatus =
  | 'activation-failed'
  | 'available'
  | 'disabled'
  | 'enabled'
  | 'installed'
  | 'partially-updated'
  | 'rollback-available'
  | 'uninstalled'
  | 'updating'

export type CanvasAppFeaturePackRuntimeState = Readonly<{
  enabled: boolean
  id: CanvasAppFeaturePackId
  installed: boolean
  status: CanvasAppFeaturePackRuntimeStateStatus
}>

export type CanvasAppFeaturePackRuntimeStateInput = Readonly<{
  enabled?: boolean
  id: CanvasAppFeaturePackId
  installed?: boolean
  status?: CanvasAppFeaturePackRuntimeStateStatus
}>

export function createCanvasAppFeaturePack(
  input: CanvasAppFeaturePackInput,
): CanvasAppFeaturePack {
  assertCanvasAppFeaturePackInput(input)

  return Object.freeze({
    extensionBundle: snapshotCanvasAppExtensionBundle(input.extensionBundle),
    id: input.id,
    label: input.label,
  })
}

export function getCanvasAppInstalledFeaturePacks(
  featurePacks: readonly CanvasAppFeaturePack[],
  options: CanvasAppFeaturePackInstallOptions = {},
) {
  assertCanvasAppFeaturePacks(featurePacks)
  const enabledIds = getCanvasAppEnabledFeaturePackIdSet(
    featurePacks.map((featurePack) => featurePack.id),
    options,
  )

  return Object.freeze(
    featurePacks.filter((featurePack) => enabledIds.has(featurePack.id)),
  ) as readonly CanvasAppFeaturePack[]
}

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

export function createCanvasAppFeaturePackExtensionBundle(
  featurePacks: readonly CanvasAppFeaturePack[],
  options: CanvasAppFeaturePackInstallOptions = {},
) {
  return getCanvasAppInstalledFeaturePacks(featurePacks, options).reduce(
    (bundle, featurePack) =>
      mergeCanvasAppExtensionBundle({
        current: bundle,
        entries: featurePack.extensionBundle,
        owner: 'app assembly',
      }),
    createEmptyCanvasAppExtensionBundle(),
  )
}

export function assertCanvasAppFeaturePacks(
  featurePacks: unknown,
): asserts featurePacks is readonly CanvasAppFeaturePack[] {
  assertCanvasAppArray(featurePacks, 'feature pack descriptors')

  const ids = new Set<string>()

  for (const featurePack of featurePacks) {
    assertCanvasAppFeaturePack(featurePack)

    if (ids.has(featurePack.id)) {
      throw new Error(`Duplicate canvas app feature pack: ${featurePack.id}`)
    }

    ids.add(featurePack.id)
  }
}

export function assertCanvasAppFeaturePackIds(
  featurePackIds: unknown,
): asserts featurePackIds is readonly CanvasAppFeaturePackId[] {
  assertCanvasAppArray(featurePackIds, 'feature pack ids')

  for (const id of featurePackIds) {
    assertCanvasAppExtensionId({
      id,
      label: 'feature pack id',
    })
  }
}

export function assertCanvasAppFeaturePack(
  featurePack: unknown,
): asserts featurePack is CanvasAppFeaturePack {
  assertCanvasAppDescriptorObject(featurePack, 'feature pack')
  assertCanvasAppExtensionId({
    id: featurePack.id,
    label: 'feature pack',
  })
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack ${featurePack.id}`,
    value: featurePack.label,
  })
  assertCanvasAppDescriptorObject(
    featurePack.extensionBundle,
    `feature pack ${featurePack.id} extension bundle`,
  )
}

function assertCanvasAppFeaturePackInput(
  input: CanvasAppFeaturePackInput,
) {
  assertCanvasAppFeaturePack(input)
}

function getCanvasAppEnabledFeaturePackIdSet(
  featurePackIds: readonly CanvasAppFeaturePackId[],
  options: CanvasAppFeaturePackInstallOptions,
) {
  return new Set(getCanvasAppEnabledFeaturePackIds(featurePackIds, options))
}

function createDefaultCanvasAppFeaturePackRuntimeStateMap(
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

function createCanvasAppFeaturePackRuntimeState(
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

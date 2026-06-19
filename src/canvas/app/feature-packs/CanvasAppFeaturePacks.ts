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
  featureFlagSettings?: readonly CanvasAppFeatureFlagSettingInput[]
  featurePackStates?: readonly CanvasAppFeaturePackRuntimeStateInput[]
}>

export type CanvasAppFeatureFlagSettingInput = Readonly<{
  enabled: boolean
  id: CanvasAppFeaturePackId
}>

export type CanvasAppFeatureFlagSettings =
  readonly CanvasAppFeatureFlagSettingInput[]

export type CanvasAppFeaturePackRuntimeStatePatchInput = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  options?: CanvasAppFeaturePackInstallOptions
}>

export type CanvasAppFeaturePackRuntimeStatePatch = Readonly<{
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  options: CanvasAppFeaturePackInstallOptions
  stateChanges: readonly CanvasAppFeaturePackRuntimeStatePatchChange[]
}>

export type CanvasAppFeaturePackRuntimeStatePatchChange = Readonly<{
  from: CanvasAppFeaturePackRuntimeState
  id: CanvasAppFeaturePackId
  to: CanvasAppFeaturePackRuntimeState
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

export function getCanvasAppFeatureFlagRuntimeStateInputs(
  settings: readonly CanvasAppFeatureFlagSettingInput[] = [],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  assertCanvasAppFeatureFlagSettings(settings)

  return Object.freeze(settings.map((setting) => Object.freeze({
    id: setting.id,
    status: setting.enabled ? 'enabled' : 'disabled',
  })))
}

export function setCanvasAppFeatureFlagSetting(
  settings: readonly CanvasAppFeatureFlagSettingInput[] = [],
  setting: CanvasAppFeatureFlagSettingInput,
): CanvasAppFeatureFlagSettings {
  assertCanvasAppFeatureFlagSettings(settings)
  assertCanvasAppFeatureFlagSetting(setting)

  let replaced = false
  const nextSettings = settings.map((current) => {
    if (current.id !== setting.id) {
      return current
    }

    replaced = true
    return setting
  })

  if (!replaced) {
    nextSettings.push(setting)
  }

  return snapshotCanvasAppFeatureFlagSettings(nextSettings)
}

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

function assertCanvasAppFeatureFlagSettings(
  settings: unknown,
): asserts settings is readonly CanvasAppFeatureFlagSettingInput[] {
  assertCanvasAppArray(settings, 'feature flag settings')

  const ids = new Set<string>()

  for (const setting of settings) {
    assertCanvasAppFeatureFlagSetting(setting)

    if (ids.has(setting.id)) {
      throw new Error(`Duplicate canvas app feature flag setting: ${setting.id}`)
    }

    ids.add(setting.id)
  }
}

function assertCanvasAppFeatureFlagSetting(
  setting: unknown,
): asserts setting is CanvasAppFeatureFlagSettingInput {
  assertCanvasAppDescriptorObject(setting, 'feature flag setting')
  assertCanvasAppExtensionId({
    id: setting.id,
    label: 'feature flag setting',
  })

  if (typeof setting.enabled !== 'boolean') {
    throw new Error(`Invalid canvas app feature flag setting enabled value: ${setting.id}`)
  }
}

function snapshotCanvasAppFeatureFlagSettings(
  settings: readonly CanvasAppFeatureFlagSettingInput[],
): CanvasAppFeatureFlagSettings {
  return Object.freeze(settings.map((setting) => Object.freeze({
    enabled: setting.enabled,
    id: setting.id,
  })))
}

function getCanvasAppEnabledFeaturePackIdSet(
  featurePackIds: readonly CanvasAppFeaturePackId[],
  options: CanvasAppFeaturePackInstallOptions,
) {
  return new Set(getCanvasAppEnabledFeaturePackIds(featurePackIds, options))
}

function getCanvasAppFeaturePackRuntimeStateInputs(
  states: readonly CanvasAppFeaturePackRuntimeState[],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  return Object.freeze(states.map((state) => Object.freeze({
    id: state.id,
    status: state.status,
  })))
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

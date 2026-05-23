import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from './CanvasAffordanceTypes'
import {
  CANVAS_AFFORDANCE_CONFIG_DEFAULTS,
  CANVAS_AFFORDANCE_CONFIG_GROUPS,
  type CanvasAffordanceConfigGroup,
} from './CanvasAffordanceCatalog'

type WritableCanvasAffordanceConfig = {
  -readonly [Group in CanvasAffordanceConfigGroup]: CanvasAffordanceConfig[Group]
}

export const DEFAULT_CANVAS_AFFORDANCE_CONFIG = createCanvasAffordanceConfig()

export function createCanvasAffordanceConfig(
  overrides: CanvasAffordanceConfigInput = {},
): CanvasAffordanceConfig {
  assertCanvasAffordanceConfigInput(overrides)

  const config = {} as CanvasAffordanceConfig

  for (const group of CANVAS_AFFORDANCE_CONFIG_GROUPS) {
    setCanvasAffordanceConfigGroup(
      config,
      group,
      mergeCanvasAffordanceConfigGroup(group, overrides[group]),
    )
  }

  return snapshotCanvasAffordanceConfig(config)
}

export function assertCanvasAffordanceConfig(
  config: CanvasAffordanceConfig,
): CanvasAffordanceConfig {
  assertCanvasAffordanceConfigObject(config, 'canvas affordance config')

  for (const group of CANVAS_AFFORDANCE_CONFIG_GROUPS) {
    assertCanvasAffordanceConfigGroup({
      defaults: CANVAS_AFFORDANCE_CONFIG_DEFAULTS[group],
      group,
      partial: false,
      values: config[group],
    })
  }

  return config
}

function assertCanvasAffordanceConfigInput(
  input: CanvasAffordanceConfigInput,
) {
  assertCanvasAffordanceConfigObject(input, 'canvas affordance config input')

  for (const key of Object.keys(input)) {
    if (!CANVAS_AFFORDANCE_CONFIG_GROUPS.includes(
      key as CanvasAffordanceConfigGroup,
    )) {
      throw new Error(`Unknown canvas affordance config group: ${key}`)
    }
  }

  for (const group of CANVAS_AFFORDANCE_CONFIG_GROUPS) {
    const values = input[group]

    if (values === undefined) {
      continue
    }

    assertCanvasAffordanceConfigGroup({
      defaults: CANVAS_AFFORDANCE_CONFIG_DEFAULTS[group],
      group,
      partial: true,
      values,
    })
  }
}

function mergeCanvasAffordanceConfigGroup<
  Group extends CanvasAffordanceConfigGroup,
>(
  group: Group,
  overrides: CanvasAffordanceConfigInput[Group],
): CanvasAffordanceConfig[Group] {
  return {
    ...CANVAS_AFFORDANCE_CONFIG_DEFAULTS[group],
    ...overrides,
  } as CanvasAffordanceConfig[Group]
}

function setCanvasAffordanceConfigGroup<
  Group extends CanvasAffordanceConfigGroup,
>(
  config: CanvasAffordanceConfig,
  group: Group,
  values: CanvasAffordanceConfig[Group],
) {
  const writableConfig = config as WritableCanvasAffordanceConfig

  writableConfig[group] = values
}

function assertCanvasAffordanceConfigGroup({
  defaults,
  group,
  partial,
  values,
}: {
  defaults: object
  group: CanvasAffordanceConfigGroup
  partial: boolean
  values: object
}) {
  assertCanvasAffordanceConfigObject(
    values,
    `canvas affordance config ${group}`,
  )
  const defaultRecord = defaults as Readonly<Record<string, boolean>>
  const valueRecord = values as Readonly<Record<string, unknown>>

  for (const key of Object.keys(valueRecord)) {
    if (!Object.hasOwn(defaultRecord, key)) {
      throw new Error(`Unknown canvas affordance config ${group}: ${key}`)
    }

    if (typeof valueRecord[key] !== 'boolean') {
      throw new Error(
        `Canvas affordance config ${group}.${key} must be boolean`,
      )
    }
  }

  if (partial) {
    return
  }

  for (const key of Object.keys(defaultRecord)) {
    if (typeof valueRecord[key] !== 'boolean') {
      throw new Error(
        `Canvas affordance config ${group}.${key} must be boolean`,
      )
    }
  }
}

function assertCanvasAffordanceConfigObject(
  value: unknown,
  label: string,
): asserts value is object {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
}

function snapshotCanvasAffordanceConfig(
  config: CanvasAffordanceConfig,
): CanvasAffordanceConfig {
  assertCanvasAffordanceConfig(config)

  const snapshot = {} as CanvasAffordanceConfig

  for (const group of CANVAS_AFFORDANCE_CONFIG_GROUPS) {
    setCanvasAffordanceConfigGroup(
      snapshot,
      group,
      freezeCanvasAffordanceConfigGroup(config[group]),
    )
  }

  return Object.freeze(snapshot) as CanvasAffordanceConfig
}

function freezeCanvasAffordanceConfigGroup<
  Group extends CanvasAffordanceConfigGroup,
>(values: CanvasAffordanceConfig[Group]): CanvasAffordanceConfig[Group] {
  return Object.freeze({ ...values }) as CanvasAffordanceConfig[Group]
}

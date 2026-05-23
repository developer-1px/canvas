import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from './CanvasAffordanceTypes'
import {
  CANVAS_AFFORDANCE_CONFIG_DEFAULTS,
  CANVAS_AFFORDANCE_CONFIG_GROUPS,
  type CanvasAffordanceConfigGroup,
} from './CanvasAffordanceCatalog'

export const DEFAULT_CANVAS_AFFORDANCE_CONFIG = createCanvasAffordanceConfig()

export function createCanvasAffordanceConfig(
  overrides: CanvasAffordanceConfigInput = {},
): CanvasAffordanceConfig {
  assertCanvasAffordanceConfigInput(overrides)

  return snapshotCanvasAffordanceConfig({
    commands: mergeFeatureGroup(
      CANVAS_AFFORDANCE_CONFIG_DEFAULTS.commands,
      overrides.commands,
    ),
    gestures: mergeFeatureGroup(
      CANVAS_AFFORDANCE_CONFIG_DEFAULTS.gestures,
      overrides.gestures,
    ),
    overlays: mergeFeatureGroup(
      CANVAS_AFFORDANCE_CONFIG_DEFAULTS.overlays,
      overrides.overlays,
    ),
    shortcuts: mergeFeatureGroup(
      CANVAS_AFFORDANCE_CONFIG_DEFAULTS.shortcuts,
      overrides.shortcuts,
    ),
    tools: mergeFeatureGroup(
      CANVAS_AFFORDANCE_CONFIG_DEFAULTS.tools,
      overrides.tools,
    ),
  })
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

function mergeFeatureGroup<T extends string>(
  defaults: Readonly<Record<T, boolean>>,
  overrides: Partial<Record<T, boolean>> | undefined,
) {
  return {
    ...defaults,
    ...overrides,
  }
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

  return Object.freeze({
    commands: freezeCanvasAffordanceConfigGroup(config.commands),
    gestures: freezeCanvasAffordanceConfigGroup(config.gestures),
    overlays: freezeCanvasAffordanceConfigGroup(config.overlays),
    shortcuts: freezeCanvasAffordanceConfigGroup(config.shortcuts),
    tools: freezeCanvasAffordanceConfigGroup(config.tools),
  }) as CanvasAffordanceConfig
}

function freezeCanvasAffordanceConfigGroup<T extends string>(
  values: Record<T, boolean>,
) {
  return Object.freeze({ ...values })
}

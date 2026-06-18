import type { CanvasAffordanceConfigInput } from '../../../engine'

export const CANVAS_APP_FACILITATION_BUNDLE_ID = 'canvas-facilitation'

export type CanvasAppFacilitationBundleOptions = {
  enabled?: boolean
}

type CanvasAppFacilitationAffordanceConfig = Required<
  Pick<
    CanvasAffordanceConfigInput,
    'gestures' | 'overlays' | 'shortcuts' | 'tools'
  >
>

type WritableCanvasAffordanceConfigInput = {
  -readonly [Group in keyof CanvasAffordanceConfigInput]?: CanvasAffordanceConfigInput[Group]
}

export const CANVAS_APP_FACILITATION_AFFORDANCE_CONFIG =
  createCanvasAppFacilitationAffordanceConfig(true)

export const CANVAS_APP_FACILITATION_DISABLED_AFFORDANCE_CONFIG =
  createCanvasAppFacilitationAffordanceConfig(false)

export function createCanvasAppFacilitationAffordanceConfigInput({
  enabled = true,
}: CanvasAppFacilitationBundleOptions = {}): CanvasAffordanceConfigInput {
  return cloneCanvasAppAffordanceConfigInput(
    enabled
      ? CANVAS_APP_FACILITATION_AFFORDANCE_CONFIG
      : CANVAS_APP_FACILITATION_DISABLED_AFFORDANCE_CONFIG,
  )
}

export function withCanvasAppFacilitationBundle(
  config: CanvasAffordanceConfigInput = {},
  options: CanvasAppFacilitationBundleOptions = {},
): CanvasAffordanceConfigInput {
  return mergeCanvasAppAffordanceConfigInput(
    config,
    createCanvasAppFacilitationAffordanceConfigInput(options),
  )
}

export function mergeCanvasAppAffordanceConfigInput(
  ...configs: readonly CanvasAffordanceConfigInput[]
): CanvasAffordanceConfigInput {
  const merged: WritableCanvasAffordanceConfigInput = {}

  for (const config of configs) {
    for (const group of CANVAS_APP_AFFORDANCE_CONFIG_GROUPS) {
      const values = config[group]

      if (values === undefined) {
        continue
      }

      mergeCanvasAppAffordanceConfigGroup(merged, group, values)
    }
  }

  return merged
}

function mergeCanvasAppAffordanceConfigGroup<
  Group extends keyof CanvasAffordanceConfigInput,
>(
  merged: WritableCanvasAffordanceConfigInput,
  group: Group,
  values: NonNullable<CanvasAffordanceConfigInput[Group]>,
) {
  merged[group] = {
    ...merged[group],
    ...values,
  } as CanvasAffordanceConfigInput[Group]
}

function createCanvasAppFacilitationAffordanceConfig(
  enabled: boolean,
): CanvasAppFacilitationAffordanceConfig {
  return deepFreezeCanvasAppAffordanceConfigInput({
    gestures: {
      emoteBurst: enabled,
      laserPointer: enabled,
    },
    overlays: {
      cursorChat: enabled,
      emoteBursts: enabled,
      emoteControls: enabled,
      laserTrail: enabled,
      sessionTimer: enabled,
      spotlight: enabled,
      votingSession: enabled,
    },
    shortcuts: {
      cursorChat: enabled,
      laserTool: enabled,
    },
    tools: {
      laser: enabled,
    },
  })
}

function cloneCanvasAppAffordanceConfigInput(
  config: CanvasAffordanceConfigInput,
): CanvasAffordanceConfigInput {
  return mergeCanvasAppAffordanceConfigInput(config)
}

function deepFreezeCanvasAppAffordanceConfigInput<
  TConfig extends CanvasAffordanceConfigInput,
>(config: TConfig): TConfig {
  for (const values of Object.values(config)) {
    Object.freeze(values)
  }

  return Object.freeze(config)
}

const CANVAS_APP_AFFORDANCE_CONFIG_GROUPS = [
  'commands',
  'gestures',
  'overlays',
  'shortcuts',
  'tools',
] as const

import type {
  CanvasAppAssemblyInput,
  CanvasAppFeaturePackRuntimeStateInput,
} from '../canvas'

export type EngineDemoFeaturePackSwitchId =
  | 'component-inspector'
  | 'component-source-outline'
  | 'component-sync'

export type EngineDemoFeaturePackSwitchState = Record<
  EngineDemoFeaturePackSwitchId,
  boolean
>

export const ENGINE_DEMO_FEATURE_PACK_SWITCH_IDS = Object.freeze([
  'component-source-outline',
  'component-inspector',
  'component-sync',
] as const) satisfies readonly EngineDemoFeaturePackSwitchId[]

export const DEFAULT_ENGINE_DEMO_FEATURE_PACK_SWITCH_STATE =
  Object.freeze({
    'component-inspector': true,
    'component-source-outline': true,
    'component-sync': true,
  }) satisfies EngineDemoFeaturePackSwitchState

export function createCanvasEngineDemoAssemblyInput({
  assemblyInput,
  featurePackSwitchState,
  featurePackSwitches,
}: {
  assemblyInput?: CanvasAppAssemblyInput
  featurePackSwitchState: EngineDemoFeaturePackSwitchState
  featurePackSwitches: boolean
}): CanvasAppAssemblyInput | undefined {
  if (!featurePackSwitches) {
    return assemblyInput
  }

  return {
    ...(assemblyInput ?? {}),
    featurePackStates: [
      ...(assemblyInput?.featurePackStates ?? []),
      ...createEngineDemoFeaturePackStates(featurePackSwitchState),
    ],
  } satisfies CanvasAppAssemblyInput
}

function createEngineDemoFeaturePackStates(
  featurePackSwitchState: EngineDemoFeaturePackSwitchState,
) {
  return ENGINE_DEMO_FEATURE_PACK_SWITCH_IDS.map(
    (id): CanvasAppFeaturePackRuntimeStateInput => ({
      id,
      status: featurePackSwitchState[id] ? 'enabled' : 'uninstalled',
    }),
  )
}

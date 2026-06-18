import type {
  CanvasAppAssemblySource,
  CanvasAppAssemblyInput,
  CanvasAppFeaturePackMarketplaceTargetControl,
  CanvasAppFeaturePackMarketplaceTarget,
} from '../canvas'
import {
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  getCanvasAppFeaturePackMarketplaceTargetControl,
} from '../canvas'

export type EngineDemoFeaturePackSwitchId =
  | 'component-inspector'
  | 'component-source-outline'
  | 'component-sync'

export type EngineDemoFeaturePackSwitchState = Record<
  EngineDemoFeaturePackSwitchId,
  boolean
>

export type EngineDemoFeaturePackSwitchControl =
  CanvasAppFeaturePackMarketplaceTargetControl & Readonly<{
    featurePackId: EngineDemoFeaturePackSwitchId
  }>

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

export type CanvasEngineDemoFeaturePackSwitchApplicationInput = Readonly<{
  enabled: boolean
  featurePackId: EngineDemoFeaturePackSwitchId
  source?: CanvasAppAssemblySource
}>

export type CanvasEngineDemoFeaturePackSwitchApplicationResult = Readonly<{
  applied: boolean
  enabled: boolean
  featurePackId: EngineDemoFeaturePackSwitchId
  source: CanvasAppAssemblySource
  status: 'applied' | 'held' | 'missing' | 'unchanged'
}>

export function createCanvasEngineDemoFeaturePackAssemblySource(
  assemblyInput?: CanvasAppAssemblyInput,
): CanvasAppAssemblySource {
  return Object.freeze({
    assemblyInput,
  })
}

export function getCanvasEngineDemoFeaturePackSwitchState(
  assemblyInput?: CanvasAppAssemblyInput,
): EngineDemoFeaturePackSwitchState {
  return Object.freeze(Object.fromEntries(
    getCanvasEngineDemoFeaturePackSwitchControls(assemblyInput)
      .map((control) => [control.featurePackId, control.active]),
  )) as EngineDemoFeaturePackSwitchState
}

export function getCanvasEngineDemoFeaturePackSwitchControls(
  assemblyInput?: CanvasAppAssemblyInput,
): readonly EngineDemoFeaturePackSwitchControl[] {
  const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput,
  })

  return Object.freeze(ENGINE_DEMO_FEATURE_PACK_SWITCH_IDS.map(
    (featurePackId) => createCanvasEngineDemoFeaturePackSwitchControl({
      control: getCanvasAppFeaturePackMarketplaceTargetControl({
        model: model.marketplaceModel,
        target: createCanvasEngineDemoFeaturePackSwitchTarget(featurePackId),
      }),
      featurePackId,
    }),
  ))
}

export async function applyCanvasEngineDemoFeaturePackSwitchToAssemblySource({
  enabled,
  featurePackId,
  source,
}: CanvasEngineDemoFeaturePackSwitchApplicationInput):
  Promise<CanvasEngineDemoFeaturePackSwitchApplicationResult> {
  const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput: source?.assemblyInput,
  })
  const currentControl = createCanvasEngineDemoFeaturePackSwitchControl({
    control: getCanvasAppFeaturePackMarketplaceTargetControl({
      model: model.marketplaceModel,
      target: createCanvasEngineDemoFeaturePackSwitchTarget(featurePackId),
    }),
    featurePackId,
  })
  const currentSource = source ??
    createCanvasEngineDemoFeaturePackAssemblySource(model.assemblyInput)

  if (currentControl.active === enabled) {
    return Object.freeze({
      applied: false,
      enabled,
      featurePackId,
      source: currentSource,
      status: 'unchanged',
    })
  }

  const result =
    await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction(
      {
        control: currentControl,
        executeCleanupEffect: () => undefined,
        model,
        source: currentSource,
      },
    )

  return Object.freeze({
    applied: result.applied,
    enabled,
    featurePackId,
    source: result.source,
    status: result.status,
  })
}

function createCanvasEngineDemoFeaturePackSwitchControl({
  control,
  featurePackId,
}: {
  control: CanvasAppFeaturePackMarketplaceTargetControl
  featurePackId: EngineDemoFeaturePackSwitchId
}): EngineDemoFeaturePackSwitchControl {
  return Object.freeze({
    ...control,
    featurePackId,
  })
}

function createCanvasEngineDemoFeaturePackSwitchTarget(
  featurePackId: EngineDemoFeaturePackSwitchId,
): CanvasAppFeaturePackMarketplaceTarget {
  return Object.freeze({
    featurePackId,
    kind: 'pack',
  })
}

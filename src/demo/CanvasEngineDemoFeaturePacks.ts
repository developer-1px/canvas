import type {
  CanvasAppAssemblySource,
  CanvasAppAssemblyInput,
  CanvasAppFeaturePackMarketplaceTarget,
} from '../canvas'
import {
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  getCanvasAppFeaturePackMarketplaceTargetItem,
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
  status: 'applied' | 'held' | 'unchanged'
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
  const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput,
  })

  return Object.freeze(Object.fromEntries(
    ENGINE_DEMO_FEATURE_PACK_SWITCH_IDS.map((featurePackId) => [
      featurePackId,
      Boolean(getCanvasEngineDemoFeaturePackSwitchItemEnabled({
        featurePackId,
        model: model.marketplaceModel,
      })),
    ]),
  )) as EngineDemoFeaturePackSwitchState
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
  const currentEnabled = getCanvasEngineDemoFeaturePackSwitchItemEnabled({
    featurePackId,
    model: model.marketplaceModel,
  })
  const currentSource = source ??
    createCanvasEngineDemoFeaturePackAssemblySource(model.assemblyInput)

  if (currentEnabled === enabled) {
    return Object.freeze({
      applied: false,
      enabled,
      featurePackId,
      source: currentSource,
      status: 'unchanged',
    })
  }

  const result =
    await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction(
      {
        executeCleanupEffect: () => undefined,
        model,
        source: currentSource,
        target: createCanvasEngineDemoFeaturePackSwitchTarget(featurePackId),
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

function createCanvasEngineDemoFeaturePackSwitchTarget(
  featurePackId: EngineDemoFeaturePackSwitchId,
): CanvasAppFeaturePackMarketplaceTarget {
  return Object.freeze({
    featurePackId,
    kind: 'pack',
  })
}

function getCanvasEngineDemoFeaturePackSwitchItemEnabled({
  featurePackId,
  model,
}: {
  featurePackId: EngineDemoFeaturePackSwitchId
  model: Parameters<typeof getCanvasAppFeaturePackMarketplaceTargetItem>[0][
    'model'
  ]
}): boolean {
  const item = getCanvasAppFeaturePackMarketplaceTargetItem({
    model,
    target: createCanvasEngineDemoFeaturePackSwitchTarget(featurePackId),
  })

  return item !== null && 'enabled' in item ? item.enabled : false
}

import type {
  CanvasAppAssemblySource,
  CanvasAppAssemblyInput,
  CanvasAppFeaturePackMarketplaceTargetControl,
  CanvasAppFeaturePackMarketplaceTarget,
} from '../canvas'
import {
  executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  getCanvasAppFeaturePackMarketplaceSelectionControlModel,
  getCanvasAppFeaturePackMarketplaceSelectionTargetControl,
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
  status:
    | 'applied'
    | 'held'
    | 'missing'
    | 'missing-selection-target'
    | 'unchanged'
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
  const selection = getCanvasAppFeaturePackMarketplaceSelectionControlModel({
    facetKind: 'all',
    model: model.marketplaceModel,
    sectionKind: 'packs',
  })

  return Object.freeze(ENGINE_DEMO_FEATURE_PACK_SWITCH_IDS.map(
    (featurePackId) => {
      const target =
        createCanvasEngineDemoFeaturePackSwitchTarget(featurePackId)

      return createCanvasEngineDemoFeaturePackSwitchControl({
        control: getCanvasAppFeaturePackMarketplaceSelectionTargetControl({
          selection,
          target,
        }) ?? getCanvasAppFeaturePackMarketplaceTargetControl({
          model: model.marketplaceModel,
          target,
        }),
        featurePackId,
      })
    },
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
  const selection = getCanvasAppFeaturePackMarketplaceSelectionControlModel({
    facetKind: 'all',
    model: model.marketplaceModel,
    sectionKind: 'packs',
  })
  const target = createCanvasEngineDemoFeaturePackSwitchTarget(featurePackId)
  const currentControl = createCanvasEngineDemoFeaturePackSwitchControl({
    control: getCanvasAppFeaturePackMarketplaceSelectionTargetControl({
      selection,
      target,
    }) ?? getCanvasAppFeaturePackMarketplaceTargetControl({
      model: model.marketplaceModel,
      target,
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
    await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction(
      {
        executeCleanupEffect: () => undefined,
        model,
        selection,
        source: currentSource,
        target,
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

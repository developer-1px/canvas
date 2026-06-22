import type {
  CanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import {
  getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput,
} from './CanvasAppFeaturePackAssemblyInputs'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
  type CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan,
} from './CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan'

export type CanvasAppFeaturePackMarketplaceActionAssemblyInput = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  assemblyInput?: CanvasAppFeaturePackAssemblyInput
}>

export type CanvasAppFeaturePackMarketplaceActionAssemblyPlan =
  | CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan
  | CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan

export type CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    assemblyInput: CanvasAppFeaturePackAssemblyInput
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status: 'ready'
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    uninstallPolicyEntries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
  }>

export type CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryAction['kind']
    blockedReasonCount: number
    changedFeaturePackIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['changedFeaturePackIds']
    marketplaceBlockedReasonCount: number
    partialUpdateSurfaceIds:
      CanvasAppFeaturePackMarketplacePrimaryAction['partialUpdateSurfaceIds']
    status: 'blocked'
    totalBlockedReasonCount: number
    uninstallDataPlan: CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan
    uninstallPolicyEntries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
  }>

export function getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackAssemblyInput {
  const plan = getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
    action,
    assemblyInput,
  })

  if (plan.status !== 'ready') {
    throw new Error(
      `Canvas app feature pack marketplace action is not ready: ${action.kind}`,
    )
  }

  return plan.assemblyInput
}

export function getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  const uninstallDataPlan =
    getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan(
      action.uninstallPolicyEntries,
    )

  if (!action.ready) {
    const blockedReasonCount = action.blockedReasons.length
    const marketplaceBlockedReasonCount = action.marketplaceBlockedReasons.length

    return Object.freeze({
      action,
      actionKind: action.kind,
      blockedReasonCount,
      changedFeaturePackIds: action.changedFeaturePackIds,
      marketplaceBlockedReasonCount,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      status: 'blocked',
      totalBlockedReasonCount:
        blockedReasonCount + marketplaceBlockedReasonCount,
      uninstallDataPlan,
      uninstallPolicyEntries: action.uninstallPolicyEntries,
    })
  }

  return Object.freeze({
    action,
    actionKind: action.kind,
    assemblyInput: getCanvasAppFeaturePackMarketplaceActionCanonicalAssemblyInput({
      action,
      assemblyInput,
    }),
    changedFeaturePackIds: action.changedFeaturePackIds,
    partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
    status: 'ready',
    uninstallDataPlan,
    uninstallPolicyEntries: action.uninstallPolicyEntries,
  })
}

function getCanvasAppFeaturePackMarketplaceActionCanonicalAssemblyInput({
  action,
  assemblyInput = {},
}: CanvasAppFeaturePackMarketplaceActionAssemblyInput):
  CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceCanonicalAssemblyInput({
    assemblyInput,
    installOptions: action.installOptions,
  })
}

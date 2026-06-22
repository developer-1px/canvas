import type {
  CanvasAppFeaturePackAssemblyInput,
} from './CanvasAppFeaturePackAssembly'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyItemAction,
  getCanvasAppFeaturePackMarketplaceAssemblyTargetAction,
  type CanvasAppFeaturePackMarketplaceAssemblyActionInput,
  type CanvasAppFeaturePackMarketplaceAssemblyItemInput,
  type CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
} from './CanvasAppFeaturePackMarketplaceAssemblyActionAdapters'
import {
  getCanvasAppFeaturePackMarketplaceActionAssemblyInput,
  getCanvasAppFeaturePackMarketplaceActionAssemblyPlan,
  type CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan,
  type CanvasAppFeaturePackMarketplaceActionAssemblyPlan,
  type CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan,
} from './CanvasAppFeaturePackMarketplaceActionAssemblyPlans'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode =
  | 'blocked'
  | 'full-rebuild'
  | 'partial-update'

export type CanvasAppFeaturePackMarketplaceAssemblyApplyPlan =
  | CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan
  | CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan

export type CanvasAppFeaturePackMarketplaceAssemblyApplyReadyPlan =
  CanvasAppFeaturePackMarketplaceActionAssemblyReadyPlan & Readonly<{
    updateMode: Exclude<
      CanvasAppFeaturePackMarketplaceAssemblyApplyUpdateMode,
      'blocked'
    >
  }>

export type CanvasAppFeaturePackMarketplaceAssemblyApplyBlockedPlan =
  CanvasAppFeaturePackMarketplaceActionAssemblyBlockedPlan & Readonly<{
    updateMode: 'blocked'
  }>

export function getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyActionInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyPlan {
  const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan(input)

  if (actionPlan.status === 'blocked') {
    return Object.freeze({
      ...actionPlan,
      updateMode: 'blocked',
    })
  }

  return Object.freeze({
    ...actionPlan,
    updateMode: actionPlan.partialUpdateSurfaceIds.length > 0
      ? 'partial-update'
      : 'full-rebuild',
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
  action,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyActionInput):
  CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  return getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
    action,
    assemblyInput: model.assemblyInput,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
  action,
  model,
}: CanvasAppFeaturePackMarketplaceAssemblyActionInput):
  CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
    action,
    assemblyInput: model.assemblyInput,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyItemActionPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyItemInput,
): CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  return getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
    action: getCanvasAppFeaturePackMarketplaceAssemblyItemAction(input),
    model: input.model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyTargetActionPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
): CanvasAppFeaturePackMarketplaceActionAssemblyPlan {
  return getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
    action: getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(input),
    model: input.model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyItemActionInput(
  input: CanvasAppFeaturePackMarketplaceAssemblyItemInput,
): CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
    action: getCanvasAppFeaturePackMarketplaceAssemblyItemAction(input),
    model: input.model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyTargetActionInput(
  input: CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
): CanvasAppFeaturePackAssemblyInput {
  return getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
    action: getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(input),
    model: input.model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyItemApplyPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyItemInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyPlan {
  return getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
    action: getCanvasAppFeaturePackMarketplaceAssemblyItemAction(input),
    model: input.model,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyTargetApplyPlan(
  input: CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
): CanvasAppFeaturePackMarketplaceAssemblyApplyPlan {
  return getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
    action: getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(input),
    model: input.model,
  })
}

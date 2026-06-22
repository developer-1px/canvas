import {
  getCanvasAppFeaturePackMarketplacePrimaryAction,
  getCanvasAppFeaturePackMarketplaceTargetItem,
  type CanvasAppFeaturePackMarketplaceItem,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackMarketplaceTarget,
} from '../feature-packs'
import type {
  CanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackAssembly'

export type CanvasAppFeaturePackMarketplaceAssemblyActionInput = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
}>

export type CanvasAppFeaturePackMarketplaceAssemblyItemInput = Readonly<{
  item: CanvasAppFeaturePackMarketplaceItem
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
}>

export type CanvasAppFeaturePackMarketplaceAssemblyTargetInput = Readonly<{
  model: CanvasAppFeaturePackMarketplaceAssemblyModel
  target: CanvasAppFeaturePackMarketplaceTarget
}>

export function getCanvasAppFeaturePackMarketplaceAssemblyItemAction({
  item,
}: CanvasAppFeaturePackMarketplaceAssemblyItemInput):
  CanvasAppFeaturePackMarketplacePrimaryAction {
  return getCanvasAppFeaturePackMarketplacePrimaryAction(item)
}

export function getCanvasAppFeaturePackMarketplaceAssemblyTargetItem({
  model,
  target,
}: CanvasAppFeaturePackMarketplaceAssemblyTargetInput):
  CanvasAppFeaturePackMarketplaceItem | null {
  return getCanvasAppFeaturePackMarketplaceTargetItem({
    model: model.marketplaceModel,
    target,
  })
}

export function getCanvasAppFeaturePackMarketplaceAssemblyTargetAction(
  input: CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
): CanvasAppFeaturePackMarketplacePrimaryAction {
  return getCanvasAppFeaturePackMarketplaceAssemblyItemAction({
    item: getCanvasAppFeaturePackMarketplaceAssemblyRequiredTargetItem(input),
    model: input.model,
  })
}

function getCanvasAppFeaturePackMarketplaceAssemblyRequiredTargetItem(
  input: CanvasAppFeaturePackMarketplaceAssemblyTargetInput,
): CanvasAppFeaturePackMarketplaceItem {
  const item = getCanvasAppFeaturePackMarketplaceAssemblyTargetItem(input)

  if (!item) {
    throw new Error(
      `Unknown canvas app feature pack marketplace assembly target: ${getCanvasAppFeaturePackMarketplaceAssemblyTargetLabel(input.target)}`,
    )
  }

  return item
}

function getCanvasAppFeaturePackMarketplaceAssemblyTargetLabel(
  target: CanvasAppFeaturePackMarketplaceTarget,
): string {
  if (target.kind === 'pack') {
    return `pack:${target.featurePackId}`
  }

  if (target.kind === 'profile') {
    return `profile:${target.profileId}`
  }

  return `suite:${target.suiteId}`
}

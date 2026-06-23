import type {
  CanvasMarketplaceItem,
  CanvasMarketplacePrimaryAction,
  CanvasMarketplacePrimaryActionKind,
  CanvasMarketplaceTarget,
} from './CanvasMarketplaceModel'
import {
  getCanvasMarketplaceItemTarget,
} from './CanvasMarketplaceModel'

export type CanvasMarketplacePanelItemId =
  | `pack:${string}`
  | `profile:${string}`
  | `suite:${string}`

export type CanvasMarketplacePanelActionInput = Readonly<{
  action: CanvasMarketplacePrimaryAction
  item: CanvasMarketplaceItem
  itemId: CanvasMarketplacePanelItemId
}>

export type CanvasMarketplacePanelTransaction = Readonly<{
  actionKind: CanvasMarketplacePrimaryActionKind
  changedFeaturePackIds: readonly string[]
  id: string
  itemId: CanvasMarketplacePanelItemId
  status: string
}>

export function getCanvasMarketplacePanelItemId(
  item: CanvasMarketplaceItem,
): CanvasMarketplacePanelItemId {
  return getCanvasMarketplacePanelTargetId(getCanvasMarketplaceItemTarget(item))
}

export function getCanvasMarketplacePanelTargetId(
  target: CanvasMarketplaceTarget,
): CanvasMarketplacePanelItemId {
  if (target.kind === 'pack') {
    return `pack:${target.featurePackId}`
  }

  if (target.kind === 'profile') {
    return `profile:${target.profileId}`
  }

  return `suite:${target.suiteId}`
}

export function getCanvasMarketplacePanelActionKey({
  actionKind,
  itemId,
}: {
  actionKind: CanvasMarketplacePrimaryActionKind
  itemId: CanvasMarketplacePanelItemId
}) {
  return `${itemId}:${actionKind}`
}

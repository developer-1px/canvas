import type {
  CanvasAppFeaturePackMarketplaceSectionAction,
  CanvasAppFeaturePackMarketplaceSectionActionItem,
} from './CanvasAppFeaturePackMarketplaceSectionContracts'

export function getCanvasAppFeaturePackMarketplaceReadyItemCount(
  items: readonly CanvasAppFeaturePackMarketplaceSectionActionItem[],
) {
  return items.filter(hasCanvasAppFeaturePackMarketplaceReadyAction).length
}

export function getCanvasAppFeaturePackMarketplaceBlockedItemCount(
  items: readonly CanvasAppFeaturePackMarketplaceSectionActionItem[],
) {
  return items.filter(hasCanvasAppFeaturePackMarketplaceBlockedAction).length
}

export function hasCanvasAppFeaturePackMarketplaceReadyAction(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return item.actions.some((action) => action.ready)
}

export function hasCanvasAppFeaturePackMarketplaceBlockedAction(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return item.actions.some((action) =>
    action.applicable && action.status === 'blocked'
  )
}

export function isCanvasAppFeaturePackMarketplacePrimaryActionReady(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return getCanvasAppFeaturePackMarketplaceItemPrimaryAction(item)?.ready === true
}

export function isCanvasAppFeaturePackMarketplacePrimaryActionBlocked(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  const primaryAction = getCanvasAppFeaturePackMarketplaceItemPrimaryAction(item)

  return primaryAction?.applicable === true &&
    primaryAction.status === 'blocked'
}

function getCanvasAppFeaturePackMarketplaceItemPrimaryAction(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
): CanvasAppFeaturePackMarketplaceSectionAction | undefined {
  return item.actions.find((action) => action.kind === item.primaryActionKind)
}

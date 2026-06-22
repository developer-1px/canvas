import type {
  CanvasAppFeaturePackMarketplaceActionItem,
} from './CanvasAppFeaturePackActions'
import type {
  CanvasAppFeaturePackProfileMarketplaceActionItem,
} from './CanvasAppFeaturePackProfileActions'
import type {
  CanvasAppFeaturePackSuiteMarketplaceActionItem,
} from './CanvasAppFeaturePackSuiteActions'
import {
  isCanvasAppFeaturePackMarketplacePrimaryActionBlocked,
  isCanvasAppFeaturePackMarketplacePrimaryActionReady,
} from './CanvasAppFeaturePackMarketplaceSectionActionItems'
import type {
  CanvasAppFeaturePackMarketplaceActionSectionSummary,
  CanvasAppFeaturePackMarketplacePackSectionSummary,
  CanvasAppFeaturePackMarketplaceProfileSectionSummary,
  CanvasAppFeaturePackMarketplaceSectionActionItem,
  CanvasAppFeaturePackMarketplaceSuiteSectionSummary,
} from './CanvasAppFeaturePackMarketplaceSectionContracts'

export function getCanvasAppFeaturePackMarketplaceProfileSectionSummary(
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplaceProfileSectionSummary {
  return Object.freeze({
    activeItemCount: items.filter((item) => item.active).length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

export function getCanvasAppFeaturePackMarketplaceSuiteSectionSummary(
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplaceSuiteSectionSummary {
  return Object.freeze({
    enabledItemCount: items.filter((item) => item.status === 'enabled').length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

export function getCanvasAppFeaturePackMarketplacePackSectionSummary(
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplacePackSectionSummary {
  return Object.freeze({
    activationFailedItemCount: items.filter((item) =>
      item.status === 'activation-failed'
    ).length,
    enabledItemCount: items.filter((item) => item.enabled).length,
    installedItemCount: items.filter((item) => item.installed).length,
    paidItemCount: items.filter((item) => item.listing.access === 'paid').length,
    partiallyUpdatedItemCount: items.filter((item) =>
      item.status === 'partially-updated'
    ).length,
    privateItemCount: items.filter((item) =>
      item.listing.access === 'private'
    ).length,
    rollbackAvailableItemCount: items.filter((item) =>
      item.status === 'rollback-available'
    ).length,
    updatingItemCount: items.filter((item) => item.status === 'updating').length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplaceActionSectionSummary(
  items: readonly CanvasAppFeaturePackMarketplaceSectionActionItem[],
): CanvasAppFeaturePackMarketplaceActionSectionSummary {
  const actions = items.flatMap((item) => item.actions)

  return Object.freeze({
    blockedActionCount: actions.filter((action) =>
      action.applicable && action.status === 'blocked'
    ).length,
    itemCount: items.length,
    primaryBlockedItemCount: items.filter((item) =>
      isCanvasAppFeaturePackMarketplacePrimaryActionBlocked(item)
    ).length,
    primaryReadyItemCount: items.filter((item) =>
      isCanvasAppFeaturePackMarketplacePrimaryActionReady(item)
    ).length,
    readyActionCount: actions.filter((action) => action.ready).length,
  })
}

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
  getCanvasAppFeaturePackMarketplaceBlockedItemCount,
  getCanvasAppFeaturePackMarketplaceReadyItemCount,
} from './CanvasAppFeaturePackMarketplaceSectionActionItems'
import type {
  CanvasAppFeaturePackMarketplacePackSectionFacetKind,
  CanvasAppFeaturePackMarketplacePackSectionSummary,
  CanvasAppFeaturePackMarketplaceProfileSectionFacetKind,
  CanvasAppFeaturePackMarketplaceProfileSectionSummary,
  CanvasAppFeaturePackMarketplaceSectionFacet,
  CanvasAppFeaturePackMarketplaceSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSuiteSectionSummary,
} from './CanvasAppFeaturePackMarketplaceSectionContracts'

export function getCanvasAppFeaturePackMarketplaceProfileSectionFacets({
  items,
  summary,
}: {
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
  summary: CanvasAppFeaturePackMarketplaceProfileSectionSummary
}): readonly CanvasAppFeaturePackMarketplaceSectionFacet<
  CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
>[] {
  return Object.freeze([
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.itemCount,
      kind: 'all',
      label: 'All',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.activeItemCount,
      kind: 'active',
      label: 'Active',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceReadyItemCount(items),
      kind: 'ready',
      label: 'Ready',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceBlockedItemCount(items),
      kind: 'blocked',
      label: 'Blocked',
    }),
  ])
}

export function getCanvasAppFeaturePackMarketplaceSuiteSectionFacets({
  items,
  summary,
}: {
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
  summary: CanvasAppFeaturePackMarketplaceSuiteSectionSummary
}): readonly CanvasAppFeaturePackMarketplaceSectionFacet<
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind
>[] {
  return Object.freeze([
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.itemCount,
      kind: 'all',
      label: 'All',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.enabledItemCount,
      kind: 'enabled',
      label: 'Enabled',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceReadyItemCount(items),
      kind: 'ready',
      label: 'Ready',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceBlockedItemCount(items),
      kind: 'blocked',
      label: 'Blocked',
    }),
  ])
}

export function getCanvasAppFeaturePackMarketplacePackSectionFacets({
  items,
  summary,
}: {
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
  summary: CanvasAppFeaturePackMarketplacePackSectionSummary
}): readonly CanvasAppFeaturePackMarketplaceSectionFacet<
  CanvasAppFeaturePackMarketplacePackSectionFacetKind
>[] {
  return Object.freeze([
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.itemCount,
      kind: 'all',
      label: 'All',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.installedItemCount,
      kind: 'installed',
      label: 'Installed',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.enabledItemCount,
      kind: 'enabled',
      label: 'Enabled',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.paidItemCount,
      kind: 'paid',
      label: 'Paid',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.privateItemCount,
      kind: 'private',
      label: 'Private',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.updatingItemCount,
      kind: 'updating',
      label: 'Updating',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.partiallyUpdatedItemCount,
      kind: 'partially-updated',
      label: 'Partially updated',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.activationFailedItemCount,
      kind: 'activation-failed',
      label: 'Activation failed',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.rollbackAvailableItemCount,
      kind: 'rollback-available',
      label: 'Rollback available',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceReadyItemCount(items),
      kind: 'ready',
      label: 'Ready',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceBlockedItemCount(items),
      kind: 'blocked',
      label: 'Blocked',
    }),
  ])
}

function createCanvasAppFeaturePackMarketplaceSectionFacet<
  TKind extends CanvasAppFeaturePackMarketplaceSectionFacetKind,
>({
  count,
  kind,
  label,
}: CanvasAppFeaturePackMarketplaceSectionFacet<TKind>):
  CanvasAppFeaturePackMarketplaceSectionFacet<TKind> {
  return Object.freeze({
    count,
    kind,
    label,
  })
}

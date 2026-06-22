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
  hasCanvasAppFeaturePackMarketplaceBlockedAction,
  hasCanvasAppFeaturePackMarketplaceReadyAction,
} from './CanvasAppFeaturePackMarketplaceSectionActionItems'
import type {
  CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplacePackSectionFacetKind,
  CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplaceProfileSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSectionActionItem,
  CanvasAppFeaturePackMarketplaceSectionFacetItems,
  CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplaceSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput,
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind,
} from './CanvasAppFeaturePackMarketplaceSectionContracts'

export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput,
): readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput,
): readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput,
): readonly CanvasAppFeaturePackMarketplaceActionItem[]
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): CanvasAppFeaturePackMarketplaceSectionFacetItems
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): CanvasAppFeaturePackMarketplaceSectionFacetItems {
  if (isCanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput(input)) {
    return Object.freeze(input.section.items.filter((item) =>
      isCanvasAppFeaturePackMarketplaceProfileSectionFacetItem({
        facetKind: input.facetKind,
        item,
      })
    ))
  }

  if (isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput(input)) {
    return Object.freeze(input.section.items.filter((item) =>
      isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItem({
        facetKind: input.facetKind,
        item,
      })
    ))
  }

  if (isCanvasAppFeaturePackMarketplacePackSectionFacetItemsInput(input)) {
    return Object.freeze(input.section.items.filter((item) =>
      isCanvasAppFeaturePackMarketplacePackSectionFacetItem({
        facetKind: input.facetKind,
        item,
      })
    ))
  }

  throw new Error('Unknown canvas app feature pack marketplace section')
}

export function isCanvasAppFeaturePackMarketplaceProfileSectionFacetKind(
  facetKind: CanvasAppFeaturePackMarketplaceSectionFacetKind,
): facetKind is CanvasAppFeaturePackMarketplaceProfileSectionFacetKind {
  return facetKind === 'active' ||
    facetKind === 'all' ||
    facetKind === 'blocked' ||
    facetKind === 'ready'
}

export function isCanvasAppFeaturePackMarketplaceSuiteSectionFacetKind(
  facetKind: CanvasAppFeaturePackMarketplaceSectionFacetKind,
): facetKind is CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind {
  return facetKind === 'all' ||
    facetKind === 'blocked' ||
    facetKind === 'enabled' ||
    facetKind === 'ready'
}

export function isCanvasAppFeaturePackMarketplacePackSectionFacetKind(
  facetKind: CanvasAppFeaturePackMarketplaceSectionFacetKind,
): facetKind is CanvasAppFeaturePackMarketplacePackSectionFacetKind {
  return facetKind === 'activation-failed' ||
    facetKind === 'all' ||
    facetKind === 'blocked' ||
    facetKind === 'enabled' ||
    facetKind === 'installed' ||
    facetKind === 'paid' ||
    facetKind === 'partially-updated' ||
    facetKind === 'private' ||
    facetKind === 'ready' ||
    facetKind === 'rollback-available' ||
    facetKind === 'updating'
}

function isCanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): input is CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput {
  return input.section.kind === 'profiles'
}

function isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): input is CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput {
  return input.section.kind === 'suites'
}

function isCanvasAppFeaturePackMarketplacePackSectionFacetItemsInput(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): input is CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput {
  return input.section.kind === 'packs'
}

function isCanvasAppFeaturePackMarketplaceProfileSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
  item: CanvasAppFeaturePackProfileMarketplaceActionItem
}) {
  if (facetKind === 'active') {
    return item.active
  }

  return isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
    facetKind,
    item,
  })
}

function isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind
  item: CanvasAppFeaturePackSuiteMarketplaceActionItem
}) {
  if (facetKind === 'enabled') {
    return item.status === 'enabled'
  }

  return isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
    facetKind,
    item,
  })
}

function isCanvasAppFeaturePackMarketplacePackSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: CanvasAppFeaturePackMarketplacePackSectionFacetKind
  item: CanvasAppFeaturePackMarketplaceActionItem
}) {
  if (facetKind === 'installed') {
    return item.installed
  }

  if (facetKind === 'enabled') {
    return item.enabled
  }

  if (facetKind === 'paid') {
    return item.listing.access === 'paid'
  }

  if (facetKind === 'private') {
    return item.listing.access === 'private'
  }

  if (
    facetKind === 'activation-failed' ||
    facetKind === 'partially-updated' ||
    facetKind === 'rollback-available' ||
    facetKind === 'updating'
  ) {
    return item.status === facetKind
  }

  return isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
    facetKind,
    item,
  })
}

function isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: 'all' | 'blocked' | 'ready'
  item: CanvasAppFeaturePackMarketplaceSectionActionItem
}) {
  if (facetKind === 'all') {
    return true
  }

  if (facetKind === 'ready') {
    return hasCanvasAppFeaturePackMarketplaceReadyAction(item)
  }

  return hasCanvasAppFeaturePackMarketplaceBlockedAction(item)
}

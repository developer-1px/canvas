import type {
  CanvasAppFeaturePackMarketplaceActionItem,
} from './CanvasAppFeaturePackActions'
import type {
  CanvasAppFeaturePackMarketplaceItem,
} from './CanvasAppFeaturePackMarketplaceSections'
import type {
  CanvasAppFeaturePackProfileMarketplaceActionItem,
} from './CanvasAppFeaturePackProfileActions'
import type {
  CanvasAppFeaturePackMarketplaceTarget,
} from './CanvasAppFeaturePackMarketplaceControlContracts'

export function getCanvasAppFeaturePackMarketplaceItemLabel(
  item: CanvasAppFeaturePackMarketplaceItem,
): string {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return item.catalogItem.label
  }

  return item.label
}

export function isCanvasAppFeaturePackMarketplaceItemActive(
  item: CanvasAppFeaturePackMarketplaceItem,
): boolean {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return item.enabled
  }

  if (isCanvasAppFeaturePackMarketplaceProfileItem(item)) {
    return item.active
  }

  return item.status === 'enabled'
}

export function isCanvasAppFeaturePackMarketplaceItemInstalled(
  item: CanvasAppFeaturePackMarketplaceItem,
): boolean {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return item.installed
  }

  if (isCanvasAppFeaturePackMarketplaceProfileItem(item)) {
    const installedIds = new Set(item.currentInstalledFeaturePackIds)

    return item.missingFeaturePackIds.length === 0 &&
      item.targetInstalledFeaturePackIds.every((id) => installedIds.has(id))
  }

  const installedIds = new Set(item.installedFeaturePackIds)

  return item.missingFeaturePackIds.length === 0 &&
    item.featurePackIds.every((id) => installedIds.has(id))
}

export function getCanvasAppFeaturePackMarketplaceTargetFallbackLabel(
  target: CanvasAppFeaturePackMarketplaceTarget,
): string {
  if (target.kind === 'pack') {
    return target.featurePackId
  }

  if (target.kind === 'profile') {
    return target.profileId
  }

  return target.suiteId
}

export function snapshotCanvasAppFeaturePackMarketplaceTarget(
  target: CanvasAppFeaturePackMarketplaceTarget,
): CanvasAppFeaturePackMarketplaceTarget {
  if (target.kind === 'pack') {
    return Object.freeze({
      featurePackId: target.featurePackId,
      kind: 'pack',
    })
  }

  if (target.kind === 'profile') {
    return Object.freeze({
      kind: 'profile',
      profileId: target.profileId,
    })
  }

  return Object.freeze({
    kind: 'suite',
    suiteId: target.suiteId,
  })
}

export function isCanvasAppFeaturePackMarketplacePackItem(
  item: CanvasAppFeaturePackMarketplaceItem,
): item is CanvasAppFeaturePackMarketplaceActionItem {
  return 'featurePackId' in item
}

export function isCanvasAppFeaturePackMarketplaceProfileItem(
  item: CanvasAppFeaturePackMarketplaceItem,
): item is CanvasAppFeaturePackProfileMarketplaceActionItem {
  return 'profileId' in item
}

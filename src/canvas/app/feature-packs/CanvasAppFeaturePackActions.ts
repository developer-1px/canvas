import {
  getCanvasAppFeaturePackCatalog,
  type CanvasAppFeaturePackCatalogBlockedReason,
  type CanvasAppFeaturePackCatalogItem,
} from './CanvasAppFeaturePackCatalog'
import {
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeStateInput,
  type CanvasAppFeaturePackRuntimeStateStatus,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionBlockedReason,
  type CanvasAppFeaturePackStateTransitionChange,
  type CanvasAppFeaturePackStateTransitionOperation,
  type CanvasAppFeaturePackStateTransitionPlan,
  type CanvasAppFeaturePackStateTransitionPlanStatus,
} from './CanvasAppFeaturePackStateTransitionPlan'

export type CanvasAppFeaturePackMarketplaceActionKind =
  CanvasAppFeaturePackStateTransitionOperation

export type CanvasAppFeaturePackMarketplaceActionModel = Readonly<{
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
}>

export type CanvasAppFeaturePackMarketplaceActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackMarketplaceAction[]
  catalogItem: CanvasAppFeaturePackCatalogItem
  catalogBlockedReasons: readonly CanvasAppFeaturePackCatalogBlockedReason[]
  enabled: boolean
  featurePackId: CanvasAppFeaturePackId
  installed: boolean
  primaryActionKind: CanvasAppFeaturePackMarketplaceActionKind
  status: CanvasAppFeaturePackRuntimeStateStatus
}>

export type CanvasAppFeaturePackMarketplaceAction = Readonly<{
  applicable: boolean
  blockedReasons: readonly CanvasAppFeaturePackStateTransitionBlockedReason[]
  changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePackStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  kind: CanvasAppFeaturePackMarketplaceActionKind
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  ready: boolean
  stateChanges: readonly CanvasAppFeaturePackStateTransitionChange[]
  status: CanvasAppFeaturePackStateTransitionPlanStatus
}>

const CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS = Object.freeze([
  'install',
  'enable',
  'disable',
  'uninstall',
] as const satisfies readonly CanvasAppFeaturePackMarketplaceActionKind[])

export function getCanvasAppFeaturePackMarketplaceActionModel({
  manifests,
  options = {},
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackMarketplaceActionModel {
  const catalog = getCanvasAppFeaturePackCatalog(manifests, options)

  return Object.freeze({
    items: Object.freeze(catalog.items.map((catalogItem) =>
      getCanvasAppFeaturePackMarketplaceActionItem({
        catalogItem,
        manifests,
        options,
      }),
    )),
  })
}

function getCanvasAppFeaturePackMarketplaceActionItem({
  catalogItem,
  manifests,
  options,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackMarketplaceActionItem {
  return Object.freeze({
    actions: Object.freeze(CANVAS_APP_FEATURE_PACK_MARKETPLACE_ACTION_KINDS.map(
      (kind) => getCanvasAppFeaturePackMarketplaceAction({
        catalogItem,
        kind,
        manifests,
        options,
      }),
    )),
    catalogBlockedReasons: catalogItem.blockedReasons,
    catalogItem,
    enabled: catalogItem.enabled,
    featurePackId: catalogItem.id,
    installed: catalogItem.installed,
    primaryActionKind:
      getCanvasAppFeaturePackMarketplacePrimaryActionKind(catalogItem),
    status: catalogItem.status,
  })
}

function getCanvasAppFeaturePackMarketplaceAction({
  catalogItem,
  kind,
  manifests,
  options,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  kind: CanvasAppFeaturePackMarketplaceActionKind
  manifests: readonly CanvasAppFeaturePackManifest[]
  options: CanvasAppFeaturePackManifestInstallOptions
}): CanvasAppFeaturePackMarketplaceAction {
  const transitionPlan = getCanvasAppFeaturePackStateTransitionPlan({
    manifests,
    operation: kind,
    options,
    targetFeaturePackIds: [catalogItem.id],
  })

  return createCanvasAppFeaturePackMarketplaceAction({
    applicable: isCanvasAppFeaturePackMarketplaceActionApplicable({
      catalogItem,
      kind,
    }),
    kind,
    transitionPlan,
  })
}

function createCanvasAppFeaturePackMarketplaceAction({
  applicable,
  kind,
  transitionPlan,
}: {
  applicable: boolean
  kind: CanvasAppFeaturePackMarketplaceActionKind
  transitionPlan: CanvasAppFeaturePackStateTransitionPlan
}): CanvasAppFeaturePackMarketplaceAction {
  return Object.freeze({
    applicable,
    blockedReasons: transitionPlan.blockedReasons,
    changedFeaturePackIds: transitionPlan.changedFeaturePackIds,
    featurePackStates: transitionPlan.featurePackStates,
    kind,
    partialUpdateSurfaceIds: transitionPlan.partialUpdateSurfaceIds,
    ready: applicable && transitionPlan.ready,
    stateChanges: transitionPlan.stateChanges,
    status: applicable ? transitionPlan.status : 'blocked',
  })
}

function isCanvasAppFeaturePackMarketplaceActionApplicable({
  catalogItem,
  kind,
}: {
  catalogItem: CanvasAppFeaturePackCatalogItem
  kind: CanvasAppFeaturePackMarketplaceActionKind
}) {
  if (kind === 'install') {
    return !catalogItem.installed
  }

  if (kind === 'enable') {
    return !catalogItem.enabled
  }

  if (kind === 'disable') {
    return catalogItem.enabled
  }

  return catalogItem.installed
}

function getCanvasAppFeaturePackMarketplacePrimaryActionKind(
  catalogItem: CanvasAppFeaturePackCatalogItem,
): CanvasAppFeaturePackMarketplaceActionKind {
  if (!catalogItem.installed) {
    return 'install'
  }

  if (!catalogItem.enabled) {
    return 'enable'
  }

  return 'disable'
}

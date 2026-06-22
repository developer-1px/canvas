import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackProfileMarketplaceActiveIdSets,
  CanvasAppFeaturePackProfileMarketplaceBlockScope,
  CanvasAppFeaturePackProfileMarketplaceConflictReason,
  CanvasAppFeaturePackProfileMarketplaceContext,
  CanvasAppFeaturePackProfileMarketplaceRequiredReason,
  CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind,
} from './CanvasAppFeaturePackProfileActionContracts'

export function getCanvasAppFeaturePackProfileMarketplaceGraphReasons(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): readonly (
  | CanvasAppFeaturePackProfileMarketplaceConflictReason
  | CanvasAppFeaturePackProfileMarketplaceRequiredReason
)[] {
  const activeIdSets =
    createCanvasAppFeaturePackProfileMarketplaceActiveIdSets(context)

  return Object.freeze([
    ...getCanvasAppFeaturePackProfileMarketplaceRequiredReasons({
      activeIdSets,
      context,
      scope: 'installed',
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceConflictReasons({
      activeIdSets,
      context,
      scope: 'installed',
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceRequiredReasons({
      activeIdSets,
      context,
      scope: 'enabled',
    }),
    ...getCanvasAppFeaturePackProfileMarketplaceConflictReasons({
      activeIdSets,
      context,
      scope: 'enabled',
    }),
  ])
}

function createCanvasAppFeaturePackProfileMarketplaceActiveIdSets(
  context: CanvasAppFeaturePackProfileMarketplaceContext,
): CanvasAppFeaturePackProfileMarketplaceActiveIdSets {
  return Object.freeze({
    enabledIds: createCanvasAppFeaturePackProfileMarketplaceActiveIdSet({
      context,
      stateKey: 'enabled',
    }),
    installedIds: createCanvasAppFeaturePackProfileMarketplaceActiveIdSet({
      context,
      stateKey: 'installed',
    }),
    knownIds: new Set(
      context.manifests.flatMap((manifest) => [
        manifest.id,
        ...manifest.provides,
      ]),
    ),
  })
}

function createCanvasAppFeaturePackProfileMarketplaceActiveIdSet({
  context,
  stateKey,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  stateKey: 'enabled' | 'installed'
}) {
  return new Set(
    context.manifests
      .filter((manifest) => context.targetStateById.get(manifest.id)?.[stateKey])
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}

function getCanvasAppFeaturePackProfileMarketplaceRequiredReasons({
  activeIdSets,
  context,
  scope,
}: {
  activeIdSets: CanvasAppFeaturePackProfileMarketplaceActiveIdSets
  context: CanvasAppFeaturePackProfileMarketplaceContext
  scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
}): readonly CanvasAppFeaturePackProfileMarketplaceRequiredReason[] {
  const satisfiedIds = scope === 'enabled'
    ? activeIdSets.enabledIds
    : activeIdSets.installedIds

  return Object.freeze(context.manifests.flatMap((manifest) => {
    if (!context.targetStateById.get(manifest.id)?.[scope]) {
      return []
    }

    return manifest.requires.flatMap((requiredId) => {
      if (satisfiedIds.has(requiredId)) {
        return []
      }

      return [Object.freeze({
        featurePackId: manifest.id,
        kind: getCanvasAppFeaturePackProfileMarketplaceRequiredReasonKind({
          activeIdSets,
          requiredId,
          scope,
        }),
        profileId: context.profile.id,
        requiredId,
        scope,
      })]
    })
  }))
}

function getCanvasAppFeaturePackProfileMarketplaceRequiredReasonKind({
  activeIdSets,
  requiredId,
  scope,
}: {
  activeIdSets: CanvasAppFeaturePackProfileMarketplaceActiveIdSets
  requiredId: CanvasAppFeaturePackId
  scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
}): CanvasAppFeaturePackProfileMarketplaceRequiredReasonKind {
  if (!activeIdSets.knownIds.has(requiredId)) {
    return 'missing-required-pack'
  }

  if (scope === 'enabled' && activeIdSets.installedIds.has(requiredId)) {
    return 'disabled-required-pack'
  }

  return 'uninstalled-required-pack'
}

function getCanvasAppFeaturePackProfileMarketplaceConflictReasons({
  activeIdSets,
  context,
  scope,
}: {
  activeIdSets: CanvasAppFeaturePackProfileMarketplaceActiveIdSets
  context: CanvasAppFeaturePackProfileMarketplaceContext
  scope: CanvasAppFeaturePackProfileMarketplaceBlockScope
}): readonly CanvasAppFeaturePackProfileMarketplaceConflictReason[] {
  const activeIds = scope === 'enabled'
    ? activeIdSets.enabledIds
    : activeIdSets.installedIds

  return Object.freeze(context.manifests.flatMap((manifest) => {
    if (!context.targetStateById.get(manifest.id)?.[scope]) {
      return []
    }

    return manifest.conflicts.flatMap((conflictId) => {
      if (!activeIds.has(conflictId)) {
        return []
      }

      return [Object.freeze({
        conflictId,
        featurePackId: manifest.id,
        kind: scope === 'enabled' ? 'enabled-conflict' : 'installed-conflict',
        profileId: context.profile.id,
        scope,
      })]
    })
  }))
}

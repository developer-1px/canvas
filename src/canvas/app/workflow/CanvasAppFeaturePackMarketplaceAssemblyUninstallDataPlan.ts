import type {
  CanvasAppFeaturePackId,
  CanvasAppFeaturePackManifestOrphanedDataScopeId,
  CanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'

export type CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan =
  Readonly<{
    entries:
      CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries']
    hostManagedFeaturePackIds: readonly CanvasAppFeaturePackId[]
    hostManagedScopeIds:
      readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    preserveFeaturePackIds: readonly CanvasAppFeaturePackId[]
    preserveScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    removeFeaturePackIds: readonly CanvasAppFeaturePackId[]
    removeScopeIds: readonly CanvasAppFeaturePackManifestOrphanedDataScopeId[]
    unscopedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  }>

export function getCanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan(
  entries: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'],
): CanvasAppFeaturePackMarketplaceAssemblyUninstallDataPlan {
  const hostManagedFeaturePackIds: CanvasAppFeaturePackId[] = []
  const hostManagedScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const preserveFeaturePackIds: CanvasAppFeaturePackId[] = []
  const preserveScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const removeFeaturePackIds: CanvasAppFeaturePackId[] = []
  const removeScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[] = []
  const unscopedFeaturePackIds: CanvasAppFeaturePackId[] = []

  for (const entry of entries) {
    const featurePackIds = getCanvasAppFeaturePackMarketplaceUninstallDataPlanFeaturePackIds({
      entry,
      hostManagedFeaturePackIds,
      preserveFeaturePackIds,
      removeFeaturePackIds,
    })
    const scopeIds = getCanvasAppFeaturePackMarketplaceUninstallDataPlanScopeIds({
      entry,
      hostManagedScopeIds,
      preserveScopeIds,
      removeScopeIds,
    })

    appendCanvasAppFeaturePackMarketplaceUniqueId(
      featurePackIds,
      entry.featurePackId,
    )

    if (entry.orphanedDataScopeIds.length === 0) {
      appendCanvasAppFeaturePackMarketplaceUniqueId(
        unscopedFeaturePackIds,
        entry.featurePackId,
      )
      continue
    }

    for (const scopeId of entry.orphanedDataScopeIds) {
      appendCanvasAppFeaturePackMarketplaceUniqueId(scopeIds, scopeId)
    }
  }

  return Object.freeze({
    entries: Object.freeze([...entries]),
    hostManagedFeaturePackIds: Object.freeze(hostManagedFeaturePackIds),
    hostManagedScopeIds: Object.freeze(hostManagedScopeIds),
    preserveFeaturePackIds: Object.freeze(preserveFeaturePackIds),
    preserveScopeIds: Object.freeze(preserveScopeIds),
    removeFeaturePackIds: Object.freeze(removeFeaturePackIds),
    removeScopeIds: Object.freeze(removeScopeIds),
    unscopedFeaturePackIds: Object.freeze(unscopedFeaturePackIds),
  })
}

export function appendCanvasAppFeaturePackMarketplaceUniqueId<
  TId extends string,
>(
  ids: TId[],
  id: TId,
) {
  if (!ids.includes(id)) {
    ids.push(id)
  }
}

function getCanvasAppFeaturePackMarketplaceUninstallDataPlanFeaturePackIds({
  entry,
  hostManagedFeaturePackIds,
  preserveFeaturePackIds,
  removeFeaturePackIds,
}: {
  entry: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'][number]
  hostManagedFeaturePackIds: CanvasAppFeaturePackId[]
  preserveFeaturePackIds: CanvasAppFeaturePackId[]
  removeFeaturePackIds: CanvasAppFeaturePackId[]
}): CanvasAppFeaturePackId[] {
  if (entry.orphanedDataPolicy === 'host-managed') {
    return hostManagedFeaturePackIds
  }

  if (entry.orphanedDataPolicy === 'remove') {
    return removeFeaturePackIds
  }

  return preserveFeaturePackIds
}

function getCanvasAppFeaturePackMarketplaceUninstallDataPlanScopeIds({
  entry,
  hostManagedScopeIds,
  preserveScopeIds,
  removeScopeIds,
}: {
  entry: CanvasAppFeaturePackMarketplacePrimaryAction['uninstallPolicyEntries'][number]
  hostManagedScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  preserveScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
  removeScopeIds: CanvasAppFeaturePackManifestOrphanedDataScopeId[]
}): CanvasAppFeaturePackManifestOrphanedDataScopeId[] {
  if (entry.orphanedDataPolicy === 'host-managed') {
    return hostManagedScopeIds
  }

  if (entry.orphanedDataPolicy === 'remove') {
    return removeScopeIds
  }

  return preserveScopeIds
}

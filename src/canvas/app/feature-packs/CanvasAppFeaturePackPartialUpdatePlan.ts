import {
  assertCanvasAppFeaturePackManifests,
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackPartialUpdateOperation =
  | 'hot-reload'
  | 'runtime-toggle'

export type CanvasAppFeaturePackPartialUpdatePlanStatus =
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackPartialUpdatePlanInput = Readonly<{
  manifests: readonly CanvasAppFeaturePackManifest[]
  operation?: CanvasAppFeaturePackPartialUpdateOperation
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackPartialUpdatePlan = Readonly<{
  blockedReasons: readonly CanvasAppFeaturePackPartialUpdatePlanBlockedReason[]
  entries: readonly CanvasAppFeaturePackPartialUpdatePlanEntry[]
  operation: CanvasAppFeaturePackPartialUpdateOperation
  ready: boolean
  status: CanvasAppFeaturePackPartialUpdatePlanStatus
  surfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  targetFeaturePackIds: readonly CanvasAppFeaturePackId[]
}>

export type CanvasAppFeaturePackPartialUpdatePlanEntry = Readonly<{
  featurePackId: CanvasAppFeaturePackId
  hotReloadable: boolean
  label: string
  runtimeToggleable: boolean
  surfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
}>

export type CanvasAppFeaturePackPartialUpdatePlanEmptySurfaceReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: 'empty-partial-update'
  }>

export type CanvasAppFeaturePackPartialUpdatePlanOperationUnavailableReason =
  Readonly<{
    featurePackId: CanvasAppFeaturePackId
    kind: 'hot-reload-unavailable' | 'runtime-toggle-unavailable'
    operation: CanvasAppFeaturePackPartialUpdateOperation
  }>

export type CanvasAppFeaturePackPartialUpdatePlanUnknownTargetReason =
  Readonly<{
    kind: 'unknown-target-pack'
    targetId: CanvasAppFeaturePackId
  }>

export type CanvasAppFeaturePackPartialUpdatePlanBlockedReason =
  | CanvasAppFeaturePackPartialUpdatePlanEmptySurfaceReason
  | CanvasAppFeaturePackPartialUpdatePlanOperationUnavailableReason
  | CanvasAppFeaturePackPartialUpdatePlanUnknownTargetReason

export function getCanvasAppFeaturePackPartialUpdatePlan(
  input: CanvasAppFeaturePackPartialUpdatePlanInput,
): CanvasAppFeaturePackPartialUpdatePlan {
  assertCanvasAppFeaturePackManifests(input.manifests)
  assertCanvasAppFeaturePackIds(input.targetFeaturePackIds)

  const operation = input.operation ?? 'runtime-toggle'

  if (operation !== 'runtime-toggle' && operation !== 'hot-reload') {
    throw new Error(
      `Invalid canvas app feature pack partial update operation: ${operation}`,
    )
  }

  const manifestById = new Map(input.manifests.map((manifest) => [
    manifest.id,
    manifest,
  ]))
  const blockedReasons: CanvasAppFeaturePackPartialUpdatePlanBlockedReason[] = []
  const entries: CanvasAppFeaturePackPartialUpdatePlanEntry[] = []
  const visitedIds = new Set<CanvasAppFeaturePackId>()

  for (const targetFeaturePackId of input.targetFeaturePackIds) {
    if (visitedIds.has(targetFeaturePackId)) {
      continue
    }

    visitedIds.add(targetFeaturePackId)

    const manifest = manifestById.get(targetFeaturePackId)

    if (!manifest) {
      blockedReasons.push(Object.freeze({
        kind: 'unknown-target-pack',
        targetId: targetFeaturePackId,
      }))
      continue
    }

    entries.push(createCanvasAppFeaturePackPartialUpdatePlanEntry(manifest))
    blockedReasons.push(
      ...getCanvasAppFeaturePackPartialUpdateBlockedReasons({
        manifest,
        operation,
      }),
    )
  }

  const surfaceIds = getCanvasAppFeaturePackPartialUpdateSurfaceIds(entries)
  const status = blockedReasons.length === 0 ? 'ready' : 'blocked'

  return Object.freeze({
    blockedReasons: Object.freeze(blockedReasons),
    entries: Object.freeze(entries),
    operation,
    ready: status === 'ready',
    status,
    surfaceIds,
    targetFeaturePackIds: Object.freeze([...input.targetFeaturePackIds]),
  })
}

function createCanvasAppFeaturePackPartialUpdatePlanEntry(
  manifest: CanvasAppFeaturePackManifest,
): CanvasAppFeaturePackPartialUpdatePlanEntry {
  return Object.freeze({
    featurePackId: manifest.id,
    hotReloadable: manifest.lifecycle.hotReloadable,
    label: manifest.label,
    runtimeToggleable: manifest.lifecycle.runtimeToggleable,
    surfaceIds: manifest.lifecycle.partialUpdate,
  })
}

function getCanvasAppFeaturePackPartialUpdateBlockedReasons({
  manifest,
  operation,
}: {
  manifest: CanvasAppFeaturePackManifest
  operation: CanvasAppFeaturePackPartialUpdateOperation
}): readonly CanvasAppFeaturePackPartialUpdatePlanBlockedReason[] {
  return Object.freeze([
    ...getCanvasAppFeaturePackPartialUpdateEmptySurfaceBlockedReasons(manifest),
    ...getCanvasAppFeaturePackPartialUpdateOperationBlockedReasons({
      manifest,
      operation,
    }),
  ])
}

function getCanvasAppFeaturePackPartialUpdateEmptySurfaceBlockedReasons(
  manifest: CanvasAppFeaturePackManifest,
): readonly CanvasAppFeaturePackPartialUpdatePlanEmptySurfaceReason[] {
  if (manifest.lifecycle.partialUpdate.length > 0) {
    return []
  }

  return [Object.freeze({
    featurePackId: manifest.id,
    kind: 'empty-partial-update',
  })]
}

function getCanvasAppFeaturePackPartialUpdateOperationBlockedReasons({
  manifest,
  operation,
}: {
  manifest: CanvasAppFeaturePackManifest
  operation: CanvasAppFeaturePackPartialUpdateOperation
}): readonly CanvasAppFeaturePackPartialUpdatePlanOperationUnavailableReason[] {
  if (operation === 'runtime-toggle' && !manifest.lifecycle.runtimeToggleable) {
    return [Object.freeze({
      featurePackId: manifest.id,
      kind: 'runtime-toggle-unavailable',
      operation,
    })]
  }

  if (operation === 'hot-reload' && !manifest.lifecycle.hotReloadable) {
    return [Object.freeze({
      featurePackId: manifest.id,
      kind: 'hot-reload-unavailable',
      operation,
    })]
  }

  return []
}

function getCanvasAppFeaturePackPartialUpdateSurfaceIds(
  entries: readonly CanvasAppFeaturePackPartialUpdatePlanEntry[],
): readonly CanvasAppFeaturePackContributionSurface[] {
  return Object.freeze(Array.from(
    new Set(entries.flatMap((entry) => entry.surfaceIds)),
  ))
}

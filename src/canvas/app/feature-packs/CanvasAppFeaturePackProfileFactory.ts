import {
  assertCanvasAppFeaturePackIds,
} from './CanvasAppFeaturePackContracts'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePackContracts'
import {
  assertCanvasAppFeaturePackProfileEnabledIds,
  assertCanvasAppFeaturePackProfileEnabledSuiteIds,
  assertCanvasAppFeaturePackProfileInput,
} from './CanvasAppFeaturePackProfileAssertions'
import type {
  CanvasAppFeaturePackProfile,
  CanvasAppFeaturePackProfileInput,
} from './CanvasAppFeaturePackProfileContracts'
import {
  getCanvasAppFeaturePackSuiteFeaturePackIds,
} from './CanvasAppFeaturePackSuites'

export function createCanvasAppFeaturePackProfile(
  input: CanvasAppFeaturePackProfileInput,
): CanvasAppFeaturePackProfile {
  assertCanvasAppFeaturePackProfileInput(input)
  const suiteManifests = input.suiteManifests ?? []
  const hasExplicitEnabledSelection =
    input.enabledFeaturePackIds !== undefined ||
    input.enabledSuiteIds !== undefined
  const installedSuiteIds = Object.freeze([
    ...(input.installedSuiteIds ?? []),
  ])
  const enabledSuiteIds = Object.freeze([
    ...(input.enabledSuiteIds ??
      (hasExplicitEnabledSelection ? [] : installedSuiteIds)),
  ])
  const installedFeaturePackIds = snapshotCanvasAppFeaturePackProfileIds([
    ...getCanvasAppFeaturePackSuiteFeaturePackIds(
      suiteManifests,
      installedSuiteIds,
    ),
    ...(input.installedFeaturePackIds ?? []),
  ])
  const enabledFeaturePackIds = hasExplicitEnabledSelection
    ? snapshotCanvasAppFeaturePackProfileIds([
      ...getCanvasAppFeaturePackSuiteFeaturePackIds(
        suiteManifests,
        enabledSuiteIds,
      ),
      ...(input.enabledFeaturePackIds ?? []),
    ])
    : installedFeaturePackIds

  assertCanvasAppFeaturePackProfileEnabledSuiteIds({
    enabledSuiteIds,
    installedSuiteIds,
    profileId: input.id,
  })
  assertCanvasAppFeaturePackProfileEnabledIds({
    enabledFeaturePackIds,
    installedFeaturePackIds,
    profileId: input.id,
  })

  return Object.freeze({
    enabledFeaturePackIds,
    enabledSuiteIds,
    id: input.id,
    installedFeaturePackIds,
    installedSuiteIds,
    label: input.label,
  })
}

function snapshotCanvasAppFeaturePackProfileIds(
  featurePackIds: readonly CanvasAppFeaturePackId[],
): readonly CanvasAppFeaturePackId[] {
  assertCanvasAppFeaturePackIds(featurePackIds)
  const ids: CanvasAppFeaturePackId[] = []
  const seenIds = new Set<CanvasAppFeaturePackId>()

  for (const id of featurePackIds) {
    if (seenIds.has(id)) {
      continue
    }

    seenIds.add(id)
    ids.push(id)
  }

  return Object.freeze(ids)
}

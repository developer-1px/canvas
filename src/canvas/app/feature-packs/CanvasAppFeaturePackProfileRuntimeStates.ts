import {
  assertCanvasAppFeaturePackIds,
} from './CanvasAppFeaturePackContracts'
import {
  assertCanvasAppFeaturePackProfile,
  assertCanvasAppFeaturePackProfileKnownIds,
} from './CanvasAppFeaturePackProfileAssertions'
import type {
  CanvasAppFeaturePackProfileRuntimeStatesInput,
} from './CanvasAppFeaturePackProfileContracts'
import type {
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePackRuntimeStateContracts'

export function getCanvasAppFeaturePackProfileRuntimeStates({
  featurePackIds,
  profile,
}: CanvasAppFeaturePackProfileRuntimeStatesInput): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  assertCanvasAppFeaturePackIds(featurePackIds)
  assertCanvasAppFeaturePackProfile(profile)
  assertCanvasAppFeaturePackProfileKnownIds({
    featurePackIds,
    profile,
  })
  const installedIds = new Set(profile.installedFeaturePackIds)
  const enabledIds = new Set(profile.enabledFeaturePackIds)

  return Object.freeze(
    featurePackIds.map((id): CanvasAppFeaturePackRuntimeStateInput => {
      if (!installedIds.has(id)) {
        return {
          id,
          status: 'uninstalled',
        }
      }

      return {
        id,
        status: enabledIds.has(id) ? 'enabled' : 'disabled',
      }
    }),
  )
}

import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  assertCanvasAppFeaturePackProfiles,
} from './CanvasAppFeaturePackProfileAssertions'
import type {
  CanvasAppFeaturePackProfile,
  CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfileContracts'

export function getCanvasAppFeaturePackProfileById(
  profiles: readonly CanvasAppFeaturePackProfile[],
  profileId: CanvasAppFeaturePackProfileId,
): CanvasAppFeaturePackProfile {
  assertCanvasAppFeaturePackProfiles(profiles)
  assertCanvasAppExtensionId({
    id: profileId,
    label: 'feature pack profile id',
  })
  const profile = profiles.find((candidate) => candidate.id === profileId)

  if (!profile) {
    throw new Error(`Unknown canvas app feature pack profile: ${profileId}`)
  }

  return profile
}

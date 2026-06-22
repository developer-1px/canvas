import {
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePackContracts'
import {
  assertCanvasAppFeaturePackSuiteIds,
  assertCanvasAppFeaturePackSuiteManifests,
  type CanvasAppFeaturePackSuiteId,
} from './CanvasAppFeaturePackSuites'
import type {
  CanvasAppFeaturePackProfile,
  CanvasAppFeaturePackProfileId,
  CanvasAppFeaturePackProfileInput,
} from './CanvasAppFeaturePackProfileContracts'

export function assertCanvasAppFeaturePackProfiles(
  profiles: unknown,
): asserts profiles is readonly CanvasAppFeaturePackProfile[] {
  if (!Array.isArray(profiles)) {
    throw new Error('Expected feature pack profiles array')
  }

  const ids = new Set<string>()

  for (const profile of profiles) {
    assertCanvasAppFeaturePackProfile(profile)

    if (ids.has(profile.id)) {
      throw new Error(`Duplicate canvas app feature pack profile: ${profile.id}`)
    }

    ids.add(profile.id)
  }
}

export function assertCanvasAppFeaturePackProfile(
  profile: unknown,
): asserts profile is CanvasAppFeaturePackProfile {
  assertCanvasAppDescriptorStringField({
    field: 'id',
    owner: 'feature pack profile',
    value: typeof profile === 'object' && profile !== null
      ? (profile as { id?: unknown }).id
      : undefined,
  })
  const typedProfile = profile as CanvasAppFeaturePackProfile

  assertCanvasAppFeaturePackProfileInput({
    enabledFeaturePackIds: typedProfile.enabledFeaturePackIds,
    enabledSuiteIds: typedProfile.enabledSuiteIds,
    id: typedProfile.id,
    installedFeaturePackIds: typedProfile.installedFeaturePackIds,
    installedSuiteIds: typedProfile.installedSuiteIds,
    label: typedProfile.label,
  })
  assertCanvasAppFeaturePackProfileEnabledSuiteIds({
    enabledSuiteIds: typedProfile.enabledSuiteIds,
    installedSuiteIds: typedProfile.installedSuiteIds,
    profileId: typedProfile.id,
  })
  assertCanvasAppFeaturePackProfileEnabledIds({
    enabledFeaturePackIds: typedProfile.enabledFeaturePackIds,
    installedFeaturePackIds: typedProfile.installedFeaturePackIds,
    profileId: typedProfile.id,
  })
}

export function assertCanvasAppFeaturePackProfileInput(
  input: CanvasAppFeaturePackProfileInput,
) {
  assertCanvasAppExtensionId({
    id: input.id,
    label: 'feature pack profile',
  })
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack profile ${input.id}`,
    value: input.label,
  })
  assertCanvasAppFeaturePackIds(input.installedFeaturePackIds ?? [])
  assertCanvasAppFeaturePackIds(input.enabledFeaturePackIds ?? [])
  assertCanvasAppFeaturePackSuiteIds(input.installedSuiteIds ?? [])
  assertCanvasAppFeaturePackSuiteIds(input.enabledSuiteIds ?? [])
  assertCanvasAppFeaturePackSuiteManifests(input.suiteManifests ?? [])
}

export function assertCanvasAppFeaturePackProfileEnabledIds({
  enabledFeaturePackIds,
  installedFeaturePackIds,
  profileId,
}: {
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  profileId: CanvasAppFeaturePackProfileId
}) {
  const installedIds = new Set(installedFeaturePackIds)

  for (const id of enabledFeaturePackIds) {
    if (!installedIds.has(id)) {
      throw new Error(
        `Feature pack profile ${profileId} enables uninstalled pack: ${id}`,
      )
    }
  }
}

export function assertCanvasAppFeaturePackProfileEnabledSuiteIds({
  enabledSuiteIds,
  installedSuiteIds,
  profileId,
}: {
  enabledSuiteIds: readonly CanvasAppFeaturePackSuiteId[]
  installedSuiteIds: readonly CanvasAppFeaturePackSuiteId[]
  profileId: CanvasAppFeaturePackProfileId
}) {
  const installedIds = new Set(installedSuiteIds)

  for (const id of enabledSuiteIds) {
    if (!installedIds.has(id)) {
      throw new Error(
        `Feature pack profile ${profileId} enables uninstalled suite: ${id}`,
      )
    }
  }
}

export function assertCanvasAppFeaturePackProfileKnownIds({
  featurePackIds,
  profile,
}: {
  featurePackIds: readonly CanvasAppFeaturePackId[]
  profile: CanvasAppFeaturePackProfile
}) {
  const knownIds = new Set(featurePackIds)

  for (const id of profile.installedFeaturePackIds) {
    if (!knownIds.has(id)) {
      throw new Error(
        `Feature pack profile ${profile.id} installs unknown pack: ${id}`,
      )
    }
  }

  for (const id of profile.enabledFeaturePackIds) {
    if (!knownIds.has(id)) {
      throw new Error(
        `Feature pack profile ${profile.id} enables unknown pack: ${id}`,
      )
    }
  }
}

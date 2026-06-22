import {
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
} from './CanvasAppDefaultFeaturePackManifests'
import {
  CANVAS_AUTHORING_BASICS_SUITE_ID,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  CANVAS_STORY_CANVAS_SUITE_ID,
} from './CanvasAppDefaultFeaturePackSuites'
import {
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppInstalledFeaturePackManifestIds,
} from './CanvasAppFeaturePackManifests'
import {
  assertCanvasAppFeaturePackSuiteIds,
  assertCanvasAppFeaturePackSuiteManifests,
  getCanvasAppFeaturePackSuiteFeaturePackIds,
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackProfileId = string

export type CanvasAppFeaturePackProfile = Readonly<{
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  enabledSuiteIds: readonly CanvasAppFeaturePackSuiteId[]
  id: CanvasAppFeaturePackProfileId
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installedSuiteIds: readonly CanvasAppFeaturePackSuiteId[]
  label: string
}>

export type CanvasAppFeaturePackProfileInput = Readonly<{
  enabledFeaturePackIds?: readonly CanvasAppFeaturePackId[]
  enabledSuiteIds?: readonly CanvasAppFeaturePackSuiteId[]
  id: CanvasAppFeaturePackProfileId
  installedFeaturePackIds?: readonly CanvasAppFeaturePackId[]
  installedSuiteIds?: readonly CanvasAppFeaturePackSuiteId[]
  label: string
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackProfileRuntimeStatesInput = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  profile: CanvasAppFeaturePackProfile
}>

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

export const CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'core-only',
    label: 'Core only',
  })

export const CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    enabledFeaturePackIds: ['zoom-controls'],
    id: 'minimal-viewer',
    installedFeaturePackIds: ['zoom-controls'],
    label: 'Minimal viewer',
  })

export const CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'story-viewer',
    installedSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
    label: 'Story viewer',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

export const CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'basic-editor',
    installedFeaturePackIds: ['zoom-controls'],
    installedSuiteIds: [CANVAS_AUTHORING_BASICS_SUITE_ID],
    label: 'Basic editor',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

export const CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    id: 'component-editor',
    installedFeaturePackIds: ['zoom-controls'],
    installedSuiteIds: [
      CANVAS_AUTHORING_BASICS_SUITE_ID,
      CANVAS_COMPONENT_SYSTEM_SUITE_ID,
    ],
    label: 'Component editor',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

const DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS = Object.freeze([
  CANVAS_AUTHORING_BASICS_SUITE_ID,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
])

const DEFAULT_CANVAS_APP_EDITOR_SUITE_FEATURE_PACK_IDS = new Set(
  getCanvasAppFeaturePackSuiteFeaturePackIds(
    DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
    DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS,
  ),
)

const DEFAULT_CANVAS_APP_EDITOR_DIRECT_FEATURE_PACK_MANIFESTS =
  Object.freeze(DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS.filter(
    (manifest) =>
      !DEFAULT_CANVAS_APP_EDITOR_SUITE_FEATURE_PACK_IDS.has(manifest.id),
  ))

export const DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_EDITOR_DIRECT_FEATURE_PACK_MANIFESTS,
    ),
    enabledSuiteIds: DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS,
    id: 'editor',
    installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_EDITOR_DIRECT_FEATURE_PACK_MANIFESTS,
    ),
    installedSuiteIds: DEFAULT_CANVAS_APP_EDITOR_SUITE_IDS,
    label: 'Editor',
    suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
  })

export const DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES = Object.freeze([
  CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE,
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_APP_BASIC_EDITOR_FEATURE_PACK_PROFILE,
  CANVAS_APP_COMPONENT_EDITOR_FEATURE_PACK_PROFILE,
  DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE,
]) satisfies readonly CanvasAppFeaturePackProfile[]

function assertCanvasAppFeaturePackProfileInput(
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

function assertCanvasAppFeaturePackProfileEnabledIds({
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

function assertCanvasAppFeaturePackProfileEnabledSuiteIds({
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

function assertCanvasAppFeaturePackProfileKnownIds({
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

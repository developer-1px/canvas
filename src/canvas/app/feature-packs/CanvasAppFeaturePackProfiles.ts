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

export const DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE =
  createCanvasAppFeaturePackProfile({
    enabledFeaturePackIds: getCanvasAppEnabledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
    ),
    id: 'editor',
    installedFeaturePackIds: getCanvasAppInstalledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
    ),
    label: 'Editor',
  })

export const DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES = Object.freeze([
  CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE,
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
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

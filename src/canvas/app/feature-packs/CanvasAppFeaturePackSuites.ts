import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  assertCanvasAppFeaturePackIds,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackSuiteId = string

export type CanvasAppFeaturePackSuiteManifest = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  id: CanvasAppFeaturePackSuiteId
  label: string
}>

export type CanvasAppFeaturePackSuiteManifestInput = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  id: CanvasAppFeaturePackSuiteId
  label: string
}>

export function createCanvasAppFeaturePackSuiteManifest(
  input: CanvasAppFeaturePackSuiteManifestInput,
): CanvasAppFeaturePackSuiteManifest {
  assertCanvasAppFeaturePackSuiteManifestInput(input)

  return Object.freeze({
    featurePackIds: snapshotCanvasAppFeaturePackSuiteFeaturePackIds(
      input.featurePackIds,
      `feature pack suite ${input.id}`,
    ),
    id: input.id,
    label: input.label,
  })
}

export function getCanvasAppFeaturePackSuiteFeaturePackIds(
  suiteManifests: readonly CanvasAppFeaturePackSuiteManifest[],
  suiteIds: readonly CanvasAppFeaturePackSuiteId[],
): readonly CanvasAppFeaturePackId[] {
  assertCanvasAppFeaturePackSuiteManifests(suiteManifests)
  assertCanvasAppFeaturePackSuiteIds(suiteIds)
  const suiteMap = new Map(
    suiteManifests.map((suite) => [suite.id, suite]),
  )
  const featurePackIds: CanvasAppFeaturePackId[] = []
  const addedFeaturePackIds = new Set<CanvasAppFeaturePackId>()

  for (const suiteId of suiteIds) {
    const suite = suiteMap.get(suiteId)

    if (!suite) {
      throw new Error(`Unknown canvas app feature pack suite: ${suiteId}`)
    }

    for (const featurePackId of suite.featurePackIds) {
      if (addedFeaturePackIds.has(featurePackId)) {
        continue
      }

      addedFeaturePackIds.add(featurePackId)
      featurePackIds.push(featurePackId)
    }
  }

  return Object.freeze(featurePackIds)
}

export function assertCanvasAppFeaturePackSuiteManifests(
  suiteManifests: unknown,
): asserts suiteManifests is readonly CanvasAppFeaturePackSuiteManifest[] {
  assertCanvasAppArray(suiteManifests, 'feature pack suite manifests')
  const ids = new Set<string>()

  for (const suiteManifest of suiteManifests) {
    assertCanvasAppFeaturePackSuiteManifest(suiteManifest)

    if (ids.has(suiteManifest.id)) {
      throw new Error(
        `Duplicate canvas app feature pack suite: ${suiteManifest.id}`,
      )
    }

    ids.add(suiteManifest.id)
  }
}

export function assertCanvasAppFeaturePackSuiteManifest(
  suiteManifest: unknown,
): asserts suiteManifest is CanvasAppFeaturePackSuiteManifest {
  assertCanvasAppDescriptorObject(
    suiteManifest,
    'feature pack suite manifest',
  )
  assertCanvasAppExtensionId({
    id: suiteManifest.id,
    label: 'feature pack suite',
  })
  const suiteId = suiteManifest.id as CanvasAppFeaturePackSuiteId
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack suite ${suiteId}`,
    value: suiteManifest.label,
  })
  assertCanvasAppFeaturePackIds(suiteManifest.featurePackIds)
  const featurePackIds = suiteManifest.featurePackIds as readonly CanvasAppFeaturePackId[]

  assertCanvasAppFeaturePackSuiteFeaturePackIds({
    featurePackIds,
    suiteId,
  })
}

export function assertCanvasAppFeaturePackSuiteIds(
  suiteIds: unknown,
): asserts suiteIds is readonly CanvasAppFeaturePackSuiteId[] {
  assertCanvasAppArray(suiteIds, 'feature pack suite ids')

  for (const id of suiteIds) {
    assertCanvasAppExtensionId({
      id,
      label: 'feature pack suite id',
    })
  }
}

function assertCanvasAppFeaturePackSuiteManifestInput(
  input: CanvasAppFeaturePackSuiteManifestInput,
) {
  assertCanvasAppFeaturePackSuiteManifest(input)
}

function snapshotCanvasAppFeaturePackSuiteFeaturePackIds(
  featurePackIds: readonly CanvasAppFeaturePackId[],
  owner: string,
): readonly CanvasAppFeaturePackId[] {
  assertCanvasAppFeaturePackIds(featurePackIds)
  assertCanvasAppFeaturePackSuiteFeaturePackIds({
    featurePackIds,
    suiteId: owner,
  })

  return Object.freeze([...featurePackIds])
}

function assertCanvasAppFeaturePackSuiteFeaturePackIds({
  featurePackIds,
  suiteId,
}: {
  featurePackIds: readonly CanvasAppFeaturePackId[]
  suiteId: string
}) {
  const ids = new Set<CanvasAppFeaturePackId>()

  for (const featurePackId of featurePackIds) {
    if (ids.has(featurePackId)) {
      throw new Error(
        `Duplicate canvas app feature pack suite feature pack: ${featurePackId}`,
      )
    }

    ids.add(featurePackId)
  }

  if (featurePackIds.length === 0) {
    throw new Error(`Feature pack suite ${suiteId} must include feature packs`)
  }
}

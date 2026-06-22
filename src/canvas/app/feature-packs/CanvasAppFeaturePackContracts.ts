import {
  snapshotCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'

export type CanvasAppFeaturePackId = string

export type CanvasAppFeaturePack = Readonly<{
  extensionBundle: CanvasAppExtensionBundle
  id: CanvasAppFeaturePackId
  label: string
}>

export type CanvasAppFeaturePackInput = Readonly<{
  extensionBundle: CanvasAppExtensionBundle
  id: CanvasAppFeaturePackId
  label: string
}>

export function createCanvasAppFeaturePack(
  input: CanvasAppFeaturePackInput,
): CanvasAppFeaturePack {
  assertCanvasAppFeaturePackInput(input)

  return Object.freeze({
    extensionBundle: snapshotCanvasAppExtensionBundle(input.extensionBundle),
    id: input.id,
    label: input.label,
  })
}

export function assertCanvasAppFeaturePacks(
  featurePacks: unknown,
): asserts featurePacks is readonly CanvasAppFeaturePack[] {
  assertCanvasAppArray(featurePacks, 'feature pack descriptors')

  const ids = new Set<string>()

  for (const featurePack of featurePacks) {
    assertCanvasAppFeaturePack(featurePack)

    if (ids.has(featurePack.id)) {
      throw new Error(`Duplicate canvas app feature pack: ${featurePack.id}`)
    }

    ids.add(featurePack.id)
  }
}

export function assertCanvasAppFeaturePackIds(
  featurePackIds: unknown,
): asserts featurePackIds is readonly CanvasAppFeaturePackId[] {
  assertCanvasAppArray(featurePackIds, 'feature pack ids')

  for (const id of featurePackIds) {
    assertCanvasAppExtensionId({
      id,
      label: 'feature pack id',
    })
  }
}

export function assertCanvasAppFeaturePack(
  featurePack: unknown,
): asserts featurePack is CanvasAppFeaturePack {
  assertCanvasAppDescriptorObject(featurePack, 'feature pack')
  assertCanvasAppExtensionId({
    id: featurePack.id,
    label: 'feature pack',
  })
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack ${featurePack.id}`,
    value: featurePack.label,
  })
  assertCanvasAppDescriptorObject(
    featurePack.extensionBundle,
    `feature pack ${featurePack.id} extension bundle`,
  )
}

function assertCanvasAppFeaturePackInput(
  input: CanvasAppFeaturePackInput,
) {
  assertCanvasAppFeaturePack(input)
}

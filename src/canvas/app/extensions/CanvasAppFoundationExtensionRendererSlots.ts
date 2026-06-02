import type {
  CanvasExtensionDescriptor,
} from '../../foundation'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from './CanvasAppDescriptorContracts'
import { snapshotCanvasAppArray } from './CanvasAppDescriptorSnapshot'
import type { CanvasAppExtensionRegistryOwner } from './CanvasAppExtensionRegistries'

export type CanvasAppFoundationRendererSlotDescriptor =
  NonNullable<CanvasExtensionDescriptor['rendererSlots']>[number]

export type CanvasAppFoundationExtensionRendererSlot = Readonly<{
  extensionId: CanvasExtensionDescriptor['id']
  id: CanvasAppFoundationRendererSlotDescriptor['id']
  surface: CanvasAppFoundationRendererSlotDescriptor['surface']
}>

type CanvasAppFoundationExtensionRendererSlotSource = Pick<
  CanvasExtensionDescriptor,
  'id' | 'rendererSlots'
>

export function getCanvasAppFoundationExtensionRendererSlots(
  extensions: readonly CanvasAppFoundationExtensionRendererSlotSource[],
) {
  assertUniqueCanvasAppFoundationExtensionRendererSlotIds({
    extensions,
    owner: 'foundation extension descriptors',
  })

  return snapshotCanvasAppArray(
    extensions.flatMap((extension) =>
      (extension.rendererSlots ?? []).map((slot) =>
        snapshotCanvasAppFoundationExtensionRendererSlot({
          extensionId: extension.id,
          slot,
        }),
      ),
    ),
  ) as readonly CanvasAppFoundationExtensionRendererSlot[]
}

export function assertUniqueCanvasAppFoundationExtensionRendererSlotIds({
  extensions,
  owner,
}: {
  extensions: readonly CanvasAppFoundationExtensionRendererSlotSource[]
  owner: CanvasAppExtensionRegistryOwner | 'foundation extension descriptors'
}) {
  assertCanvasAppArray(extensions, 'foundation extension descriptors')

  const ids = new Set<string>()

  for (const extension of extensions) {
    assertCanvasAppDescriptorObject(extension, 'foundation extension')
    assertCanvasAppDescriptorStringField({
      field: 'id',
      owner: 'foundation extension',
      value: extension.id,
    })
    assertCanvasAppFoundationRendererSlotDescriptors(extension.rendererSlots)

    for (const slot of extension.rendererSlots ?? []) {
      if (ids.has(slot.id)) {
        throw new Error(
          `Duplicate canvas ${owner} foundation extension renderer slot: ${slot.id}`,
        )
      }

      ids.add(slot.id)
    }
  }
}

export function assertCanvasAppFoundationRendererSlotDescriptors(
  rendererSlots: unknown,
): asserts rendererSlots is readonly CanvasAppFoundationRendererSlotDescriptor[] | undefined {
  if (rendererSlots === undefined) {
    return
  }

  assertCanvasAppArray(rendererSlots, 'foundation extension renderer slots')

  for (const slot of rendererSlots) {
    assertCanvasAppDescriptorObject(slot, 'foundation extension renderer slot')
    assertCanvasAppDescriptorStringField({
      field: 'id',
      owner: 'foundation extension renderer slot',
      value: slot.id,
    })
    assertCanvasAppDescriptorStringField({
      field: 'surface',
      owner: 'foundation extension renderer slot',
      value: slot.surface,
    })
  }
}

export function snapshotCanvasAppFoundationRendererSlotDescriptor(
  slot: CanvasAppFoundationRendererSlotDescriptor,
) {
  return Object.freeze({ ...slot })
}

function snapshotCanvasAppFoundationExtensionRendererSlot({
  extensionId,
  slot,
}: {
  extensionId: CanvasExtensionDescriptor['id']
  slot: CanvasAppFoundationRendererSlotDescriptor
}): CanvasAppFoundationExtensionRendererSlot {
  return Object.freeze({
    extensionId,
    id: slot.id,
    surface: slot.surface,
  })
}

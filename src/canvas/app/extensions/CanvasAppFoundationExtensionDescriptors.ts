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
import {
  assertCanvasAppFoundationCommandDescriptors,
  assertUniqueCanvasAppFoundationExtensionCommandIds,
  snapshotCanvasAppFoundationCommandDescriptor,
} from './CanvasAppFoundationExtensionCommands'
import {
  assertCanvasAppFoundationRendererSlotDescriptors,
  assertUniqueCanvasAppFoundationExtensionRendererSlotIds,
  snapshotCanvasAppFoundationRendererSlotDescriptor,
} from './CanvasAppFoundationExtensionRendererSlots'
import {
  assertCanvasAppFoundationToolDescriptors,
  assertUniqueCanvasAppFoundationExtensionToolIds,
  snapshotCanvasAppFoundationToolDescriptor,
} from './CanvasAppFoundationExtensionTools'

export type CanvasAppFoundationExtension = CanvasExtensionDescriptor

export function appendUniqueCanvasAppFoundationExtensions({
  current,
  entries,
  owner,
}: {
  current: readonly CanvasAppFoundationExtension[]
  entries: readonly CanvasAppFoundationExtension[]
  owner: CanvasAppExtensionRegistryOwner
}) {
  assertCanvasAppFoundationExtensions(current)
  assertCanvasAppFoundationExtensions(entries)

  const ids = new Set(current.map((entry) => entry.id))

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(
        `Duplicate canvas ${owner} foundation extension: ${entry.id}`,
      )
    }

    ids.add(entry.id)
  }

  const merged = [...current, ...entries]

  assertUniqueCanvasAppFoundationExtensionToolIds({
    extensions: merged,
    owner,
  })
  assertUniqueCanvasAppFoundationExtensionCommandIds({
    extensions: merged,
    owner,
  })
  assertUniqueCanvasAppFoundationExtensionRendererSlotIds({
    extensions: merged,
    owner,
  })

  return merged
}

export function assertCanvasAppFoundationExtensions(
  extensions: unknown,
): asserts extensions is readonly CanvasAppFoundationExtension[] {
  assertCanvasAppArray(extensions, 'foundation extension descriptors')

  const foundationExtensions =
    extensions as readonly CanvasAppFoundationExtension[]

  for (const extension of foundationExtensions) {
    assertCanvasAppDescriptorObject(extension, 'foundation extension')
    assertCanvasAppDescriptorStringField({
      field: 'id',
      owner: 'foundation extension',
      value: extension.id,
    })
    assertOptionalCanvasAppFoundationDescriptorArray({
      label: 'foundation extension requiredAdapters',
      value: extension.requiredAdapters,
    })
    assertCanvasAppFoundationCommandDescriptors(extension.commands)
    assertCanvasAppFoundationRendererSlotDescriptors(extension.rendererSlots)
    assertCanvasAppFoundationToolDescriptors(extension.tools)
  }

  assertUniqueCanvasAppFoundationExtensionCommandIds({
    extensions: foundationExtensions,
    owner: 'foundation extension descriptors',
  })
  assertUniqueCanvasAppFoundationExtensionRendererSlotIds({
    extensions: foundationExtensions,
    owner: 'foundation extension descriptors',
  })
  assertUniqueCanvasAppFoundationExtensionToolIds({
    extensions: foundationExtensions,
    owner: 'foundation extension descriptors',
  })
}

export function snapshotCanvasAppFoundationExtensions(
  extensions: readonly CanvasAppFoundationExtension[],
) {
  assertCanvasAppFoundationExtensions(extensions)

  return snapshotCanvasAppArray(
    extensions.map(snapshotCanvasAppFoundationExtension),
  ) as readonly CanvasAppFoundationExtension[]
}

function assertOptionalCanvasAppFoundationDescriptorArray({
  label,
  value,
}: {
  label: string
  value: unknown
}) {
  if (value !== undefined) {
    assertCanvasAppArray(value, label)
  }
}

function snapshotCanvasAppFoundationExtension(
  extension: CanvasAppFoundationExtension,
): CanvasAppFoundationExtension {
  return Object.freeze({
    ...extension,
    ...(extension.commands ? {
      commands: snapshotCanvasAppArray(
        extension.commands.map(snapshotCanvasAppFoundationCommandDescriptor),
      ),
    } : {}),
    ...(extension.rendererSlots ? {
      rendererSlots: snapshotCanvasAppArray(
        extension.rendererSlots.map(
          snapshotCanvasAppFoundationRendererSlotDescriptor,
        ),
      ),
    } : {}),
    ...(extension.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(extension.requiredAdapters),
    } : {}),
    ...(extension.tools ? {
      tools: snapshotCanvasAppArray(
        extension.tools.map(snapshotCanvasAppFoundationToolDescriptor),
      ),
    } : {}),
  }) as CanvasAppFoundationExtension
}

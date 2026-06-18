import type {
  CanvasExtensionAdapterSlot,
  CanvasExtensionDescriptor,
} from '../../../foundation'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../CanvasAppDescriptorContracts'
import { snapshotCanvasAppArray } from '../CanvasAppDescriptorSnapshot'
import type { CanvasAppExtensionRegistryOwner } from '../CanvasAppExtensionRegistries'

export type CanvasAppFoundationCommandDescriptor =
  NonNullable<CanvasExtensionDescriptor['commands']>[number]

export type CanvasAppFoundationExtensionCommand = Readonly<{
  extensionId: CanvasExtensionDescriptor['id']
  id: CanvasAppFoundationCommandDescriptor['id']
  plan: CanvasAppFoundationCommandDescriptor['plan']
  requiredAdapters?: readonly CanvasExtensionAdapterSlot[]
}>

type CanvasAppFoundationExtensionCommandSource = Pick<
  CanvasExtensionDescriptor,
  'commands' | 'id'
>

export function getCanvasAppFoundationExtensionCommands(
  extensions: readonly CanvasAppFoundationExtensionCommandSource[],
) {
  assertUniqueCanvasAppFoundationExtensionCommandIds({
    extensions,
    owner: 'foundation extension descriptors',
  })

  return snapshotCanvasAppArray(
    extensions.flatMap((extension) =>
      (extension.commands ?? []).map((command) =>
        snapshotCanvasAppFoundationExtensionCommand({
          command,
          extensionId: extension.id,
        }),
      ),
    ),
  ) as readonly CanvasAppFoundationExtensionCommand[]
}

export function assertUniqueCanvasAppFoundationExtensionCommandIds({
  extensions,
  owner,
}: {
  extensions: readonly CanvasAppFoundationExtensionCommandSource[]
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
    assertCanvasAppFoundationCommandDescriptors(extension.commands)

    for (const command of extension.commands ?? []) {
      if (ids.has(command.id)) {
        throw new Error(
          `Duplicate canvas ${owner} foundation extension command: ${command.id}`,
        )
      }

      ids.add(command.id)
    }
  }
}

export function assertCanvasAppFoundationCommandDescriptors(
  commands: unknown,
): asserts commands is readonly CanvasAppFoundationCommandDescriptor[] | undefined {
  if (commands === undefined) {
    return
  }

  assertCanvasAppArray(commands, 'foundation extension command descriptors')

  for (const command of commands) {
    assertCanvasAppDescriptorObject(command, 'foundation extension command')
    assertCanvasAppDescriptorStringField({
      field: 'id',
      owner: 'foundation extension command',
      value: command.id,
    })
    assertCanvasAppDescriptorFunctionField({
      field: 'plan',
      owner: 'foundation extension command',
      value: command.plan,
    })
    assertOptionalCanvasAppFoundationCommandArray({
      label: 'foundation extension command requiredAdapters',
      value: command.requiredAdapters,
    })
  }
}

export function snapshotCanvasAppFoundationCommandDescriptor(
  command: CanvasAppFoundationCommandDescriptor,
) {
  return Object.freeze({
    ...command,
    ...(command.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(command.requiredAdapters),
    } : {}),
  })
}

function snapshotCanvasAppFoundationExtensionCommand({
  command,
  extensionId,
}: {
  command: CanvasAppFoundationCommandDescriptor
  extensionId: CanvasExtensionDescriptor['id']
}): CanvasAppFoundationExtensionCommand {
  return Object.freeze({
    extensionId,
    id: command.id,
    plan: command.plan,
    ...(command.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(command.requiredAdapters),
    } : {}),
  })
}

function assertOptionalCanvasAppFoundationCommandArray({
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

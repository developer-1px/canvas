import type { CanvasExtensionDescriptor } from '../../../foundation'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../CanvasAppDescriptorContracts'
import { snapshotCanvasAppArray } from '../CanvasAppDescriptorSnapshot'
import type { CanvasAppExtensionRegistryOwner } from '../CanvasAppExtensionRegistries'
import { assertCanvasAppRequiredCapability } from '../../CanvasAppCapabilityContracts'

export type CanvasAppFoundationCommandDescriptor =
  NonNullable<CanvasExtensionDescriptor['commands']>[number]

type CanvasAppFoundationExtensionCommandSource = Pick<
  CanvasExtensionDescriptor,
  'commands' | 'id'
>

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
    assertCanvasAppDescriptorStringField({
      field: 'requiredCapability',
      owner: 'foundation extension command',
      value: command.requiredCapability,
    })
    assertCanvasAppRequiredCapability({
      owner: `foundation extension command ${command.id}`,
      value: command.requiredCapability,
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

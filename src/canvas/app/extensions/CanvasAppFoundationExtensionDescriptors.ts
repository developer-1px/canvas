import type {
  CanvasExtensionDescriptor,
} from '../../foundation'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from './CanvasAppDescriptorContracts'
import { snapshotCanvasAppArray } from './CanvasAppDescriptorSnapshot'
import type { CanvasAppExtensionRegistryOwner } from './CanvasAppExtensionRegistries'

export type CanvasAppFoundationExtension = CanvasExtensionDescriptor

type CanvasAppFoundationCommandDescriptor =
  NonNullable<CanvasAppFoundationExtension['commands']>[number]

type CanvasAppFoundationRendererSlot =
  NonNullable<CanvasAppFoundationExtension['rendererSlots']>[number]

type CanvasAppFoundationToolDescriptor =
  NonNullable<CanvasAppFoundationExtension['tools']>[number]

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

  return [...current, ...entries]
}

export function assertCanvasAppFoundationExtensions(
  extensions: unknown,
): asserts extensions is readonly CanvasAppFoundationExtension[] {
  assertCanvasAppArray(extensions, 'foundation extension descriptors')

  for (const extension of extensions) {
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
    assertCanvasAppFoundationCommands(extension.commands)
    assertCanvasAppFoundationRendererSlots(extension.rendererSlots)
    assertCanvasAppFoundationTools(extension.tools)
  }
}

export function snapshotCanvasAppFoundationExtensions(
  extensions: readonly CanvasAppFoundationExtension[],
) {
  assertCanvasAppFoundationExtensions(extensions)

  return snapshotCanvasAppArray(
    extensions.map(snapshotCanvasAppFoundationExtension),
  ) as readonly CanvasAppFoundationExtension[]
}

function assertCanvasAppFoundationCommands(
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
    assertOptionalCanvasAppFoundationDescriptorArray({
      label: 'foundation extension command requiredAdapters',
      value: command.requiredAdapters,
    })
  }
}

function assertCanvasAppFoundationRendererSlots(
  rendererSlots: unknown,
): asserts rendererSlots is readonly CanvasAppFoundationRendererSlot[] | undefined {
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

function assertCanvasAppFoundationTools(
  tools: unknown,
): asserts tools is readonly CanvasAppFoundationToolDescriptor[] | undefined {
  if (tools === undefined) {
    return
  }

  assertCanvasAppArray(tools, 'foundation extension tool descriptors')

  for (const tool of tools) {
    assertCanvasAppDescriptorObject(tool, 'foundation extension tool')
    assertCanvasAppDescriptorStringField({
      field: 'id',
      owner: 'foundation extension tool',
      value: tool.id,
    })
    assertCanvasAppDescriptorStringField({
      field: 'kind',
      owner: 'foundation extension tool',
      value: tool.kind,
    })
    assertOptionalCanvasAppFoundationDescriptorArray({
      label: 'foundation extension tool requiredAdapters',
      value: tool.requiredAdapters,
    })
  }
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
        extension.commands.map(snapshotCanvasAppFoundationCommand),
      ),
    } : {}),
    ...(extension.rendererSlots ? {
      rendererSlots: snapshotCanvasAppArray(
        extension.rendererSlots.map(snapshotCanvasAppFoundationRendererSlot),
      ),
    } : {}),
    ...(extension.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(extension.requiredAdapters),
    } : {}),
    ...(extension.tools ? {
      tools: snapshotCanvasAppArray(
        extension.tools.map(snapshotCanvasAppFoundationTool),
      ),
    } : {}),
  }) as CanvasAppFoundationExtension
}

function snapshotCanvasAppFoundationCommand(
  command: CanvasAppFoundationCommandDescriptor,
) {
  return Object.freeze({
    ...command,
    ...(command.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(command.requiredAdapters),
    } : {}),
  })
}

function snapshotCanvasAppFoundationRendererSlot(
  slot: CanvasAppFoundationRendererSlot,
) {
  return Object.freeze({ ...slot })
}

function snapshotCanvasAppFoundationTool(
  tool: CanvasAppFoundationToolDescriptor,
) {
  return Object.freeze({
    ...tool,
    ...(tool.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(tool.requiredAdapters),
    } : {}),
  })
}

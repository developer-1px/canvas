import type { CanvasExtensionDescriptor } from '../../../foundation'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../CanvasAppDescriptorContracts'
import { snapshotCanvasAppArray } from '../CanvasAppDescriptorSnapshot'
import type { CanvasAppExtensionRegistryOwner } from '../CanvasAppExtensionRegistries'
import { assertCanvasAppRequiredCapability } from '../../CanvasAppCapabilityContracts'

export type CanvasAppFoundationToolDescriptor =
  NonNullable<CanvasExtensionDescriptor['tools']>[number]

type CanvasAppFoundationExtensionToolSource = Pick<
  CanvasExtensionDescriptor,
  'id' | 'tools'
>

export function assertUniqueCanvasAppFoundationExtensionToolIds({
  extensions,
  owner,
}: {
  extensions: readonly CanvasAppFoundationExtensionToolSource[]
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
    assertCanvasAppFoundationToolDescriptors(extension.tools)

    for (const tool of extension.tools ?? []) {
      if (ids.has(tool.id)) {
        throw new Error(
          `Duplicate canvas ${owner} foundation extension tool: ${tool.id}`,
        )
      }

      ids.add(tool.id)
    }
  }
}

export function assertCanvasAppFoundationToolDescriptors(
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
    assertCanvasAppDescriptorStringField({
      field: 'requiredCapability',
      owner: 'foundation extension tool',
      value: tool.requiredCapability,
    })
    assertCanvasAppRequiredCapability({
      owner: `foundation extension tool ${tool.id}`,
      value: tool.requiredCapability,
    })
    assertOptionalCanvasAppFoundationToolArray({
      label: 'foundation extension tool requiredAdapters',
      value: tool.requiredAdapters,
    })
  }
}

export function snapshotCanvasAppFoundationToolDescriptor(
  tool: CanvasAppFoundationToolDescriptor,
) {
  return Object.freeze({
    ...tool,
    ...(tool.requiredAdapters ? {
      requiredAdapters: snapshotCanvasAppArray(tool.requiredAdapters),
    } : {}),
  })
}

function assertOptionalCanvasAppFoundationToolArray({
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

import type {
  CanvasExtensionAdapterSlot,
  CanvasExtensionDescriptor,
  CanvasExtensionToolKind,
} from '../../../foundation'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../CanvasAppDescriptorContracts'
import { snapshotCanvasAppArray } from '../CanvasAppDescriptorSnapshot'
import type { CanvasAppExtensionRegistryOwner } from '../CanvasAppExtensionRegistries'

export type CanvasAppFoundationToolDescriptor =
  NonNullable<CanvasExtensionDescriptor['tools']>[number]

export type CanvasAppFoundationExtensionTool = Readonly<{
  extensionId: CanvasExtensionDescriptor['id']
  id: CanvasAppFoundationToolDescriptor['id']
  kind: CanvasExtensionToolKind
  requiredAdapters?: readonly CanvasExtensionAdapterSlot[]
}>

type CanvasAppFoundationExtensionToolSource = Pick<
  CanvasExtensionDescriptor,
  'id' | 'tools'
>

export function getCanvasAppFoundationExtensionTools(
  extensions: readonly CanvasAppFoundationExtensionToolSource[],
) {
  assertUniqueCanvasAppFoundationExtensionToolIds({
    extensions,
    owner: 'foundation extension descriptors',
  })

  return snapshotCanvasAppArray(
    extensions.flatMap((extension) =>
      (extension.tools ?? []).map((tool) =>
        snapshotCanvasAppFoundationExtensionTool({
          extensionId: extension.id,
          tool,
        }),
      ),
    ),
  ) as readonly CanvasAppFoundationExtensionTool[]
}

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

function snapshotCanvasAppFoundationExtensionTool({
  extensionId,
  tool,
}: {
  extensionId: CanvasExtensionDescriptor['id']
  tool: CanvasAppFoundationToolDescriptor
}): CanvasAppFoundationExtensionTool {
  return Object.freeze({
    extensionId,
    id: tool.id,
    kind: tool.kind,
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

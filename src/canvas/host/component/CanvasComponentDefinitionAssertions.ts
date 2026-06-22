import {
  assertCanvasStableId,
} from '../../core'
import type {
  CanvasComponentDefinition,
  CreateCanvasComponentDefinitionRegistryInput,
} from './CanvasComponentDefinitionContracts'
import {
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
} from './CanvasComponentDefinitionContracts'

export function assertCanvasComponentDefinitionRegistryInput(
  input: unknown,
): asserts input is CreateCanvasComponentDefinitionRegistryInput {
  if (!isRecord(input)) {
    throw new Error('Canvas component definition registry input must be an object')
  }

  if (
    input.definitions !== undefined &&
    !Array.isArray(input.definitions)
  ) {
    throw new Error('Canvas component definitions must be an array')
  }
}

export function assertCanvasComponentDefinitions<TItemId extends string>(
  definitions: readonly CanvasComponentDefinition<TItemId>[],
) {
  const definitionIds = new Set<string>()
  const itemIds = new Set<string>()

  for (const definition of definitions) {
    assertCanvasComponentDefinition(definition)

    if (definitionIds.has(definition.id)) {
      throw new Error(`Duplicate canvas component definition: ${definition.id}`)
    }

    definitionIds.add(definition.id)

    for (const instance of definition.instances) {
      for (const [slotId, itemId] of Object.entries(instance.slots)) {
        assertCanvasStableId({
          id: slotId,
          label: 'component slot',
        })

        if (typeof itemId !== 'string' || itemId.trim().length === 0) {
          throw new Error(
            `Canvas component definition ${definition.id} requires slot item id`,
          )
        }

        if (itemIds.has(itemId)) {
          throw new Error(`Duplicate canvas component definition item id: ${itemId}`)
        }

        itemIds.add(itemId)
      }
    }
  }
}

function assertCanvasComponentDefinition(
  definition: unknown,
): asserts definition is CanvasComponentDefinition {
  if (!isRecord(definition)) {
    throw new Error('Canvas component definition must be an object')
  }

  assertCanvasStableId({
    id: definition.id,
    label: 'component definition',
  })
  assertCanvasComponentDefinitionStringField({
    field: 'label',
    owner: `component definition ${String(definition.id)}`,
    value: definition.label,
  })
  assertCanvasComponentDefinitionOptionalStringField({
    field: 'syncDescription',
    owner: `component definition ${String(definition.id)}`,
    value: definition.syncDescription,
  })
  assertCanvasComponentDefinitionSource(definition.source)

  if (!Array.isArray(definition.instances) || definition.instances.length === 0) {
    throw new Error(
      `Canvas component definition ${String(definition.id)} requires instances`,
    )
  }

  for (const instance of definition.instances) {
    assertCanvasComponentDefinitionInstance({
      definitionId: String(definition.id),
      instance,
    })
  }
}

function assertCanvasComponentDefinitionInstance({
  definitionId,
  instance,
}: {
  definitionId: string
  instance: unknown
}) {
  if (!isRecord(instance)) {
    throw new Error(
      `Canvas component definition ${definitionId} instance must be an object`,
    )
  }

  assertCanvasComponentDefinitionStringField({
    field: 'label',
    owner: `component definition ${definitionId} instance`,
    value: instance.label,
  })

  if (!isRecord(instance.slots) || Object.keys(instance.slots).length === 0) {
    throw new Error(
      `Canvas component definition ${definitionId} requires instance slots`,
    )
  }

  if (
    typeof instance.slots[CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID] !==
      'string'
  ) {
    throw new Error(
      `Canvas component definition ${definitionId} requires a root slot`,
    )
  }
}

function assertCanvasComponentDefinitionSource(source: unknown) {
  if (source === undefined) {
    return
  }

  if (!isRecord(source)) {
    throw new Error('Canvas component source must be an object')
  }

  assertCanvasComponentDefinitionStringField({
    field: 'exportName',
    owner: 'component source',
    value: source.exportName,
  })
  assertCanvasComponentDefinitionStringField({
    field: 'importPath',
    owner: 'component source',
    value: source.importPath,
  })
  assertCanvasComponentDefinitionStringField({
    field: 'layer',
    owner: 'component source',
    value: source.layer,
  })
}

function assertCanvasComponentDefinitionStringField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Canvas ${owner} requires ${field}`)
  }
}

function assertCanvasComponentDefinitionOptionalStringField({
  field,
  owner,
  value,
}: {
  field: string
  owner: string
  value: unknown
}) {
  if (value !== undefined) {
    assertCanvasComponentDefinitionStringField({ field, owner, value })
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

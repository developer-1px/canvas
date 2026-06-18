import { assertCanvasStableId } from '../../core'

export type CanvasComponentDefinitionId = string
export type CanvasComponentSlotId = string
export type CanvasComponentSource = Readonly<{
  exportName: string
  importPath: string
  layer: string
}>

export type CanvasComponentDefinitionInstance<
  TItemId extends string = string,
> = Readonly<{
  label: string
  slots: Readonly<Record<CanvasComponentSlotId, TItemId>>
}>

export type CanvasComponentDefinition<TItemId extends string = string> =
  Readonly<{
    id: CanvasComponentDefinitionId
    instances: readonly CanvasComponentDefinitionInstance<TItemId>[]
    label: string
    source?: CanvasComponentSource
    syncDescription?: string
  }>

export type CanvasComponentBinding<TItemId extends string = string> =
  Readonly<{
    componentId: CanvasComponentDefinitionId
    componentLabel: string
    currentItemId: TItemId
    instanceCount: number
    instanceLabel: string
    slotId: CanvasComponentSlotId
    slotItemIds: readonly TItemId[]
    syncDescription?: string
  }>

export type CanvasComponentSlotSummary<TItemId extends string = string> =
  Readonly<{
    itemId: TItemId
    label: string
    slotId: CanvasComponentSlotId
  }>

export type CanvasComponentInstanceSummary<TItemId extends string = string> =
  Readonly<{
    itemIds: readonly TItemId[]
    label: string
    rootItemId: TItemId
    slots: readonly CanvasComponentSlotSummary<TItemId>[]
  }>

export type CanvasComponentPartSummary<TItemId extends string = string> =
  Readonly<{
    itemIds: readonly TItemId[]
    label: string
    slotId: CanvasComponentSlotId
  }>

export type CanvasComponentSetSummary<TItemId extends string = string> =
  Readonly<{
    id: CanvasComponentDefinitionId
    instances: readonly CanvasComponentInstanceSummary<TItemId>[]
    label: string
    parts: readonly CanvasComponentPartSummary<TItemId>[]
    source?: CanvasComponentSource
    syncDescription?: string
  }>

export type CanvasComponentLinkedItemSyncInput<
  TItemId extends string,
  TState,
> = Readonly<{
  itemId: TItemId
  state: TState
  update: (state: TState, itemId: TItemId) => TState
}>

export type CanvasComponentDefinitionRegistry<
  TItemId extends string = string,
> = Readonly<{
  definitions: readonly CanvasComponentDefinition<TItemId>[]
  getBinding: (itemId: TItemId) => CanvasComponentBinding<TItemId> | null
  getSyncItemIds: (itemId: TItemId) => readonly TItemId[]
  isRootItem: (itemId: TItemId) => boolean
  listSets: () => readonly CanvasComponentSetSummary<TItemId>[]
  syncItems: <TState>(
    input: CanvasComponentLinkedItemSyncInput<TItemId, TState>,
  ) => TState
}>

export type CreateCanvasComponentDefinitionRegistryInput<
  TItemId extends string = string,
> = Readonly<{
  definitions?: readonly CanvasComponentDefinition<TItemId>[]
}>

export const CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID = 'root'

export function createCanvasComponentDefinitionRegistry<
  TItemId extends string = string,
>(
  input: CreateCanvasComponentDefinitionRegistryInput<TItemId> = {},
): CanvasComponentDefinitionRegistry<TItemId> {
  assertCanvasComponentDefinitionRegistryInput(input)
  const definitions = cloneCanvasComponentDefinitions(input.definitions ?? [])

  assertCanvasComponentDefinitions(definitions)

  return Object.freeze({
    definitions,
    getBinding: (itemId) => getCanvasComponentBinding(definitions, itemId),
    getSyncItemIds: (itemId) =>
      getCanvasComponentBinding(definitions, itemId)?.slotItemIds ?? [itemId],
    isRootItem: (itemId) =>
      definitions.some((definition) =>
        definition.instances.some((instance) =>
          instance.slots[CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID] === itemId,
        ),
      ),
    listSets: () => listCanvasComponentSets(definitions),
    syncItems: ({ itemId, state, update }) =>
      (getCanvasComponentBinding(definitions, itemId)?.slotItemIds ?? [itemId])
        .reduce((current, syncItemId) =>
          update(current, syncItemId), state),
  })
}

export const CANVAS_COMPONENT_DEFINITION_REGISTRY =
  createCanvasComponentDefinitionRegistry()

function getCanvasComponentBinding<TItemId extends string>(
  definitions: readonly CanvasComponentDefinition<TItemId>[],
  itemId: TItemId,
): CanvasComponentBinding<TItemId> | null {
  for (const definition of definitions) {
    for (const instance of definition.instances) {
      for (const [slotId, slotItemId] of Object.entries(instance.slots)) {
        if (slotItemId !== itemId) {
          continue
        }

        return Object.freeze({
          componentId: definition.id,
          componentLabel: definition.label,
          currentItemId: itemId,
          instanceCount: definition.instances.length,
          instanceLabel: instance.label,
          slotId,
          slotItemIds: getCanvasComponentSlotItemIds(definition, slotId),
          syncDescription: definition.syncDescription,
        })
      }
    }
  }

  return null
}

function listCanvasComponentSets<TItemId extends string>(
  definitions: readonly CanvasComponentDefinition<TItemId>[],
): readonly CanvasComponentSetSummary<TItemId>[] {
  return Object.freeze(
    definitions.map((definition) => {
      const instances = Object.freeze(
        definition.instances.map((instance) => {
          const slots = Object.freeze(
            Object.entries(instance.slots)
              .sort(([left], [right]) =>
                compareCanvasComponentSlotIds(left, right))
              .map(([slotId, itemId]) =>
                Object.freeze({
                  itemId,
                  label: formatCanvasComponentSlotLabel(slotId),
                  slotId,
                }),
              ),
          )
          const rootItemId = instance.slots[
            CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID
          ]

          return Object.freeze({
            itemIds: Object.freeze(slots.map((slot) => slot.itemId)),
            label: instance.label,
            rootItemId,
            slots,
          })
        }),
      )

      return Object.freeze({
        id: definition.id,
        instances,
        label: definition.label,
        parts: getCanvasComponentParts(definition),
        source: definition.source,
        syncDescription: definition.syncDescription,
      })
    }),
  )
}

function getCanvasComponentParts<TItemId extends string>(
  definition: CanvasComponentDefinition<TItemId>,
): readonly CanvasComponentPartSummary<TItemId>[] {
  const slotIds = Array.from(new Set(
    definition.instances.flatMap((instance) => Object.keys(instance.slots)),
  )).sort(compareCanvasComponentSlotIds)

  return Object.freeze(
    slotIds.map((slotId) =>
      Object.freeze({
        itemIds: getCanvasComponentSlotItemIds(definition, slotId),
        label: formatCanvasComponentSlotLabel(slotId),
        slotId,
      }),
    ),
  )
}

function getCanvasComponentSlotItemIds<TItemId extends string>(
  definition: CanvasComponentDefinition<TItemId>,
  slotId: CanvasComponentSlotId,
): readonly TItemId[] {
  return Object.freeze(definition.instances.flatMap((instance) => {
    const itemId = instance.slots[slotId]

    return itemId ? [itemId] : []
  }))
}

function compareCanvasComponentSlotIds(left: string, right: string) {
  if (left === CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID) {
    return right === CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID ? 0 : -1
  }

  if (right === CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID) {
    return 1
  }

  return left.localeCompare(right)
}

function formatCanvasComponentSlotLabel(slotId: string) {
  const label = slotId.replace(/[-_]/g, ' ')

  return label ? label[0].toUpperCase() + label.slice(1) : 'Part'
}

function cloneCanvasComponentDefinitions<TItemId extends string>(
  definitions: readonly CanvasComponentDefinition<TItemId>[],
) {
  return Object.freeze(
    definitions.map((definition) =>
      freezeCanvasComponentDefinition(cloneCanvasComponentDefinition(definition)),
    ),
  )
}

function cloneCanvasComponentDefinition<TItemId extends string>(
  definition: CanvasComponentDefinition<TItemId>,
): CanvasComponentDefinition<TItemId> {
  return {
    ...definition,
    instances: definition.instances.map((instance) => ({
      ...instance,
      slots: { ...instance.slots },
    })),
    source: definition.source ? { ...definition.source } : undefined,
  }
}

function freezeCanvasComponentDefinition<TItemId extends string>(
  definition: CanvasComponentDefinition<TItemId>,
) {
  if (definition.source) {
    Object.freeze(definition.source)
  }

  for (const instance of definition.instances) {
    Object.freeze(instance.slots)
    Object.freeze(instance)
  }

  Object.freeze(definition.instances)

  return Object.freeze(definition)
}

function assertCanvasComponentDefinitionRegistryInput(
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

function assertCanvasComponentDefinitions<TItemId extends string>(
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

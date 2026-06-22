import type {
  CanvasComponentDefinition,
} from './CanvasComponentDefinitionContracts'

export function cloneCanvasComponentDefinitions<TItemId extends string>(
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

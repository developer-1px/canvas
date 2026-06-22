import {
  assertCanvasComponentDefinitionRegistryInput,
  assertCanvasComponentDefinitions,
} from './CanvasComponentDefinitionAssertions'
import {
  cloneCanvasComponentDefinitions,
} from './CanvasComponentDefinitionClones'
import type {
  CanvasComponentDefinitionRegistry,
  CreateCanvasComponentDefinitionRegistryInput,
} from './CanvasComponentDefinitionContracts'
import {
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
} from './CanvasComponentDefinitionContracts'
import {
  getCanvasComponentBinding,
} from './CanvasComponentDefinitionQueries'
import {
  listCanvasComponentSets,
} from './CanvasComponentDefinitionSummaries'

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

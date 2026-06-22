import type {
  CanvasComponentBinding,
  CanvasComponentDefinition,
} from './CanvasComponentDefinitionContracts'
import {
  getCanvasComponentSlotItemIds,
} from './CanvasComponentDefinitionSlots'

export function getCanvasComponentBinding<TItemId extends string>(
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

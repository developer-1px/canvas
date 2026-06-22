import type {
  CanvasComponentDefinition,
  CanvasComponentPartSummary,
  CanvasComponentSetSummary,
} from './CanvasComponentDefinitionContracts'
import {
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
} from './CanvasComponentDefinitionContracts'
import {
  compareCanvasComponentSlotIds,
  formatCanvasComponentSlotLabel,
  getCanvasComponentSlotItemIds,
} from './CanvasComponentDefinitionSlots'

export function listCanvasComponentSets<TItemId extends string>(
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

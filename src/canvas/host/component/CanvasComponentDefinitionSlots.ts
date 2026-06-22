import type {
  CanvasComponentDefinition,
  CanvasComponentSlotId,
} from './CanvasComponentDefinitionContracts'
import {
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
} from './CanvasComponentDefinitionContracts'

export function getCanvasComponentSlotItemIds<TItemId extends string>(
  definition: CanvasComponentDefinition<TItemId>,
  slotId: CanvasComponentSlotId,
): readonly TItemId[] {
  return Object.freeze(definition.instances.flatMap((instance) => {
    const itemId = instance.slots[slotId]

    return itemId ? [itemId] : []
  }))
}

export function compareCanvasComponentSlotIds(left: string, right: string) {
  if (left === CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID) {
    return right === CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID ? 0 : -1
  }

  if (right === CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID) {
    return 1
  }

  return left.localeCompare(right)
}

export function formatCanvasComponentSlotLabel(slotId: string) {
  const label = slotId.replace(/[-_]/g, ' ')

  return label ? label[0].toUpperCase() + label.slice(1) : 'Part'
}

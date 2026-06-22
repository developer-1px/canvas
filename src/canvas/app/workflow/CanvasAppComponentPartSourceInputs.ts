import type {
  CanvasComponentPartSourceInput,
} from '../../engine'
import type {
  CanvasComponentSetSummary,
} from '../../host'

export function createCanvasComponentPartSourceInputs(
  componentSets: readonly CanvasComponentSetSummary[],
): readonly CanvasComponentPartSourceInput[] {
  return componentSets.flatMap((componentSet) =>
    componentSet.parts.map((part) => ({
      componentId: componentSet.id,
      componentLabel: componentSet.label,
      id: `${componentSet.id}:${part.slotId}`,
      itemIds: part.itemIds,
      label: part.label,
      slotId: part.slotId,
    })),
  )
}

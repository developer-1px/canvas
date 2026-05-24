import { useCanvasObjectInspector } from '../inspector/useCanvasObjectInspector'
import type { CanvasAppInspectorModelInput } from './CanvasAppConsumerContracts'

export function useCanvasAppInspectorModel({
  commitItemsChange,
  config,
  inspectorPanels,
  itemReadModel,
  selected,
  selection,
}: CanvasAppInspectorModelInput) {
  return {
    ...useCanvasObjectInspector({
      commitItemsChange,
      inspectorPanels,
      itemReadModel,
      selected,
      selection,
    }),
    visible: config.overlays.inspector,
  }
}

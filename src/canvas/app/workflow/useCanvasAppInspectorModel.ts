import { useCanvasObjectInspector } from '../affordances/editing/inspector/useCanvasObjectInspector'
import type { CanvasAppInspectorModelInput } from './CanvasAppInspectorConsumerContracts'

export function useCanvasAppInspectorModel({
  commitItemsChange,
  componentDefinitionRegistry,
  config,
  customFocus,
  inspectorPanels,
  itemReadModel,
  selected,
  selection,
}: CanvasAppInspectorModelInput) {
  return {
    ...useCanvasObjectInspector({
      commitItemsChange,
      componentDefinitionRegistry,
      config,
      customFocus,
      inspectorPanels,
      itemReadModel,
      selected,
      selection,
    }),
    visible: config.overlays.inspector,
  }
}

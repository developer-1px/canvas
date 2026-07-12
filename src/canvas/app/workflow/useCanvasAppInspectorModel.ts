import { useCanvasObjectInspector } from '../affordances/editing/inspector/useCanvasObjectInspector'
import type { CanvasAppInspectorModelInput } from './CanvasAppInspectorConsumerContracts'

export function useCanvasAppInspectorModel({
  config,
  customFocus,
  document,
  items,
  inspectorPanels,
  itemReadModel,
  selected,
  selection,
}: CanvasAppInspectorModelInput) {
  return {
    ...useCanvasObjectInspector({
      config,
      customFocus,
      document,
      items,
      inspectorPanels,
      itemReadModel,
      selected,
      selection,
    }),
    visible: config.overlays.inspector,
  }
}

import type { CanvasItemReadModel } from '../../host'
import { useCanvasObjectInspector } from '../inspector/useCanvasObjectInspector'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

type UseCanvasAppInspectorModelArgs = {
  commitItemsChange: CommitCanvasItemsChange
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  itemReadModel: CanvasItemReadModel
  selected: Set<string>
  selection: string[]
}

export function useCanvasAppInspectorModel({
  commitItemsChange,
  inspectorPanels,
  itemReadModel,
  selected,
  selection,
}: UseCanvasAppInspectorModelArgs) {
  return useCanvasObjectInspector({
    commitItemsChange,
    inspectorPanels,
    itemReadModel,
    selected,
    selection,
  })
}

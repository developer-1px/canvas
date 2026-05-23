import { useMemo } from 'react'
import type { CanvasItemReadModel } from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppInspectorPanel } from './CanvasAppInspectorPanels'
import { getCanvasObjectInspectorModel } from './CanvasObjectInspectorModel'

type UseCanvasObjectInspectorArgs = {
  itemReadModel: CanvasItemReadModel
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  selected: Set<string>
  selection: string[]
  commitItemsChange: CommitCanvasItemsChange
}

export function useCanvasObjectInspector({
  commitItemsChange,
  itemReadModel,
  inspectorPanels,
  selected,
  selection,
}: UseCanvasObjectInspectorArgs) {
  const bounds = useMemo(
    () => itemReadModel.getSelectionBounds(selected),
    [itemReadModel, selected],
  )
  const selectedItems = useMemo(
    () => itemReadModel.getSelectedItems(selection),
    [itemReadModel, selection],
  )
  const inspectorModel = useMemo(
    () =>
      getCanvasObjectInspectorModel({
        bounds,
        commitItemsChange,
        inspectorPanels,
        selectedItems,
        selection,
      }),
    [
      bounds,
      commitItemsChange,
      inspectorPanels,
      selectedItems,
      selection,
    ],
  )

  return inspectorModel
}

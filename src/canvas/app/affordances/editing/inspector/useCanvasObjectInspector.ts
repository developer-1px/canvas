import { useMemo } from 'react'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppCustomFocus } from '../../interaction/focus/CanvasAppCustomFocus'
import type { CanvasAppInspectorPanel } from './CanvasAppInspectorPanels'
import { getCanvasObjectInspectorModel } from './CanvasObjectInspectorModel'

type UseCanvasObjectInspectorArgs = {
  itemReadModel: CanvasAppItemReadModel
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  selected: Set<string>
  selection: string[]
  commitItemsChange: CommitCanvasItemsChange
  customFocus: CanvasAppCustomFocus | null
}

export function useCanvasObjectInspector({
  commitItemsChange,
  customFocus,
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
  const items = useMemo(
    () => itemReadModel.getAllItems(),
    [itemReadModel],
  )
  const inspectorModel = useMemo(
    () =>
      getCanvasObjectInspectorModel({
        bounds,
        commitItemsChange,
        customFocus,
        inspectorPanels,
        items,
        selectedItems,
        selection,
      }),
    [
      bounds,
      commitItemsChange,
      customFocus,
      inspectorPanels,
      items,
      selectedItems,
      selection,
    ],
  )

  return inspectorModel
}

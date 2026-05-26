import type {
  Bounds,
  CanvasItem,
} from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import { getCanvasAppInspectorPanelViews } from './CanvasAppInspectorPanelExecution'
import type { CanvasAppInspectorPanel } from './CanvasAppInspectorPanels'
import { getCanvasObjectInspectorLabel } from './CanvasObjectInspectorLabel'
import { getCanvasObjectStyleControls } from './CanvasObjectStyleInspector'

type GetCanvasObjectInspectorModelArgs = {
  bounds: Bounds | null
  commitItemsChange: CommitCanvasItemsChange
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}

export function getCanvasObjectInspectorModel({
  bounds,
  commitItemsChange,
  inspectorPanels,
  items,
  selectedItems,
  selection,
}: GetCanvasObjectInspectorModelArgs) {
  const label = getCanvasObjectInspectorLabel({
    selectedItems,
    selectionLength: selection.length,
  })
  const disabled = selectedItems.some((item) => item.locked === true)

  return {
    bounds,
    customPanels: getCanvasAppInspectorPanelViews({
      context: {
        bounds,
        commitItemsChange,
        disabled,
        items: items ?? selectedItems,
        label,
        selectedItems,
        selection,
      },
      panels: inspectorPanels,
    }),
    disabled,
    label,
    styleControls: getCanvasObjectStyleControls({
      commitItemsChange,
      disabled,
      selectedItems,
      selection,
    }),
    onChangeBounds: (nextBounds: Bounds) => {
      if (selection.length === 0 || !bounds) {
        return
      }

      commitItemsChange(
        {
          type: 'resize-selection',
          from: bounds,
          selection,
          to: nextBounds,
        },
        {
          before: selection,
          after: selection,
        },
      )
    },
  }
}

import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import { getCanvasAppInspectorPanelViews } from './CanvasAppInspectorPanelExecution'
import type { CanvasAppInspectorPanel } from './CanvasAppInspectorPanels'

type GetCanvasObjectInspectorModelArgs = {
  bounds: Bounds | null
  commitItemsChange: CommitCanvasItemsChange
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  selectedItems: CanvasItem[]
  selection: string[]
}

export function getCanvasObjectInspectorModel({
  bounds,
  commitItemsChange,
  inspectorPanels,
  selectedItems,
  selection,
}: GetCanvasObjectInspectorModelArgs) {
  const label = getInspectorLabel(selectedItems, selection.length)
  const disabled = selectedItems.some((item) => item.locked === true)

  return {
    bounds,
    customPanels: getCanvasAppInspectorPanelViews({
      context: {
        bounds,
        commitItemsChange,
        disabled,
        label,
        selectedItems,
        selection,
      },
      panels: inspectorPanels,
    }),
    disabled,
    label,
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

function getInspectorLabel(items: CanvasItem[], selectionLength: number) {
  if (selectionLength === 0) {
    return null
  }

  if (selectionLength > 1) {
    return `${selectionLength} selected`
  }

  const [item] = items

  if (!item) {
    return null
  }

  if (item.type === 'component') {
    return capitalize(item.component)
  }

  return capitalize(item.type)
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}

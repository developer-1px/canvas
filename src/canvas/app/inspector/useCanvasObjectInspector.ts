import { useCallback, useMemo } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import {
  getCanvasAppInspectorPanelViews,
  type CanvasAppInspectorPanel,
} from './CanvasAppInspectorPanels'

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
  const label = getInspectorLabel(selectedItems, selection.length)
  const disabled = selectedItems.some((item) => item.locked === true)
  const customPanels = useMemo(
    () =>
      getCanvasAppInspectorPanelViews({
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
    [
      bounds,
      commitItemsChange,
      disabled,
      inspectorPanels,
      label,
      selectedItems,
      selection,
    ],
  )

  const updateBounds = useCallback(
    (nextBounds: Bounds) => {
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
    [bounds, commitItemsChange, selection],
  )

  return {
    bounds,
    customPanels,
    disabled,
    label,
    onChangeBounds: updateBounds,
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

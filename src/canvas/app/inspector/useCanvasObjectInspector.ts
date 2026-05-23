import { useCallback, useMemo } from 'react'
import type { Bounds } from '../../core'
import type { CanvasItem } from '../../host/model'
import { createCanvasItemReadModel } from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'

type UseCanvasObjectInspectorArgs = {
  items: CanvasItem[]
  selected: Set<string>
  selection: string[]
  commitItemsChange: CommitCanvasItemsChange
}

export function useCanvasObjectInspector({
  commitItemsChange,
  items,
  selected,
  selection,
}: UseCanvasObjectInspectorArgs) {
  const itemReadModel = useMemo(() => createCanvasItemReadModel(items), [items])
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

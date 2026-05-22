import { useCallback, useMemo } from 'react'
import type { Bounds } from '../../engine/primitives/CanvasPrimitives'
import { resizeCanvasItems } from '../../host/operations/CanvasOperations'
import type { CanvasItem } from '../../host/model/CanvasModel'
import { findCanvasItem, unionBounds } from '../../host/tree/CanvasTree'
import type { CommitCanvasItems } from '../document/useCanvasHistory'

type UseCanvasObjectInspectorArgs = {
  items: CanvasItem[]
  selected: Set<string>
  selection: string[]
  setItems: CommitCanvasItems
}

export function useCanvasObjectInspector({
  items,
  selected,
  selection,
  setItems,
}: UseCanvasObjectInspectorArgs) {
  const bounds = useMemo(
    () => unionBounds(items, selected),
    [items, selected],
  )
  const selectedItems = useMemo(
    () =>
      selection
        .map((id) => findCanvasItem(items, id))
        .filter((item): item is CanvasItem => item !== undefined),
    [items, selection],
  )
  const label = getInspectorLabel(selectedItems, selection.length)
  const disabled = selectedItems.some((item) => item.locked === true)

  const updateBounds = useCallback(
    (nextBounds: Bounds) => {
      if (selection.length === 0) {
        return
      }

      setItems(
        (current) => {
          const currentBounds = unionBounds(current, new Set(selection))

          return currentBounds
            ? resizeCanvasItems(current, selection, currentBounds, nextBounds)
            : current
        },
        {
          before: selection,
          after: selection,
        },
      )
    },
    [selection, setItems],
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

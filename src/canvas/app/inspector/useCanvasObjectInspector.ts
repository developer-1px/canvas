import { useCallback, useMemo } from 'react'
import type { Bounds } from '../../engine/primitives/CanvasPrimitives'
import type { CanvasItem } from '../../host/model/CanvasModel'
import { createResizeCanvasItemsPatch } from '../../host/document/CanvasDocumentPatches'
import { findCanvasItem, unionBounds } from '../../host/tree/CanvasTree'
import type { CommitCanvasItemsPatch } from '../document/useCanvasDocument'

type UseCanvasObjectInspectorArgs = {
  items: CanvasItem[]
  selected: Set<string>
  selection: string[]
  commitItemsPatch: CommitCanvasItemsPatch
}

export function useCanvasObjectInspector({
  commitItemsPatch,
  items,
  selected,
  selection,
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
      if (selection.length === 0 || !bounds) {
        return
      }

      commitItemsPatch(
        createResizeCanvasItemsPatch(items, selection, bounds, nextBounds),
        {
          before: selection,
          after: selection,
        },
      )
    },
    [bounds, commitItemsPatch, items, selection],
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

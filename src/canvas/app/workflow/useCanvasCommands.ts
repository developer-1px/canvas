import {
  useCallback,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import {
  CANVAS_COMMAND_INSERT_OFFSET,
  cloneCanvasCommandItems,
  copyCanvasCommand,
  cutCanvasCommand,
  deleteCanvasCommand,
  duplicateCanvasCommand,
  groupCanvasCommand,
  lockCanvasCommand,
  nudgeCanvasCommand,
  pasteCanvasCommand,
  reorderCanvasCommand,
  selectAllCanvasCommand,
  ungroupCanvasCommand,
  unlockAllCanvasCommand,
  type CanvasCommandAdapter,
  type CanvasReorderMode,
} from '../../engine/CanvasCommandEngine'
import type { CanvasAffordanceConfig } from '../../engine/CanvasAffordances'
import type { Point, Viewport } from '../../engine/CanvasPrimitives'
import type { CanvasItem, EditingText } from '../../host/CanvasModel'
import { getCanvasPasteOffset } from './CanvasPastePosition'
import type { CommitCanvasItems } from './useCanvasHistory'

type UseCanvasCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  redo: () => string[] | undefined
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setItems: CommitCanvasItems
  setSelection: Dispatch<SetStateAction<string[]>>
  svgRef: RefObject<SVGSVGElement | null>
  undo: () => string[] | undefined
  viewport: Viewport
}

export function useCanvasCommands({
  commandAdapter,
  config,
  createId,
  items,
  redo,
  selection,
  setEditing,
  setItems,
  setSelection,
  svgRef,
  undo,
  viewport,
}: UseCanvasCommandsArgs) {
  const clipboardRef = useRef<CanvasItem[]>([])
  const pasteIndexRef = useRef(0)

  const cloneItems = useCallback(
    (ids: string[], offset: Point) =>
      cloneCanvasCommandItems({
        adapter: commandAdapter,
        createId,
        ids,
        items,
        offset,
      }),
    [commandAdapter, createId, items],
  )

  const duplicateSelection = useCallback(
    (sourceIds = selection, offset: Point = CANVAS_COMMAND_INSERT_OFFSET) => {
      const result = duplicateCanvasCommand({
        adapter: commandAdapter,
        config,
        createId,
        items,
        offset,
        selection,
        sourceIds,
      })

      if (!result) {
        return []
      }

      setItems(result.items, {
        before: selection,
        after: result.selection,
      })
      setSelection(result.selection)
      return result.clones
    },
    [commandAdapter, config, createId, items, selection, setItems, setSelection],
  )

  const copySelection = useCallback(() => {
    const clipboard = copyCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!clipboard) {
      return
    }

    clipboardRef.current = clipboard
    pasteIndexRef.current = 0
  }, [commandAdapter, config, items, selection])

  const pasteSelection = useCallback(() => {
    const offset = getCanvasPasteOffset({
      clipboard: clipboardRef.current,
      pasteIndex: pasteIndexRef.current,
      viewportCenter: getViewportCenter(svgRef, viewport),
    })
    const result = pasteCanvasCommand({
      adapter: commandAdapter,
      clipboard: clipboardRef.current,
      config,
      createId,
      items,
      offset,
    })

    if (!result) {
      return
    }

    clipboardRef.current = result.clipboard
    pasteIndexRef.current += 1
    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [
    commandAdapter,
    config,
    createId,
    items,
    selection,
    setItems,
    setSelection,
    svgRef,
    viewport,
  ])

  const deleteSelection = useCallback(() => {
    const result = deleteCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setEditing((current) =>
      current && result.clearEditingIds.includes(current.id) ? null : current,
    )
    setSelection(result.selection)
  }, [commandAdapter, config, items, selection, setEditing, setItems, setSelection])

  const groupSelection = useCallback(() => {
    const result = groupCanvasCommand({
      adapter: commandAdapter,
      config,
      createId,
      items,
      selection,
    })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [commandAdapter, config, createId, items, selection, setItems, setSelection])

  const ungroupSelection = useCallback(() => {
    const result = ungroupCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [commandAdapter, config, items, selection, setItems, setSelection])

  const lockSelection = useCallback(() => {
    const result = lockCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [commandAdapter, config, items, selection, setItems, setSelection])

  const unlockAll = useCallback(() => {
    const result = unlockAllCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [commandAdapter, config, items, selection, setItems, setSelection])

  const undoHistory = useCallback(() => {
    if (!config.commands.undo) {
      return
    }

    const restoredSelection = undo()
    setEditing(null)
    if (restoredSelection) {
      setSelection(restoredSelection)
    }
  }, [config.commands.undo, setEditing, setSelection, undo])

  const redoHistory = useCallback(() => {
    if (!config.commands.redo) {
      return
    }

    const restoredSelection = redo()
    setEditing(null)
    if (restoredSelection) {
      setSelection(restoredSelection)
    }
  }, [config.commands.redo, redo, setEditing, setSelection])

  const cutSelection = useCallback(() => {
    const result = cutCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
      selection,
    })

    if (!result) {
      return
    }

    if (result.clipboard) {
      clipboardRef.current = result.clipboard
      pasteIndexRef.current = 0
    }

    const deletion = result.deletion

    if (!deletion) {
      return
    }

    setItems(deletion.items, {
      before: selection,
      after: deletion.selection,
    })
    setEditing((current) =>
      current && deletion.clearEditingIds.includes(current.id)
        ? null
        : current,
    )
    setSelection(deletion.selection)
  }, [commandAdapter, config, items, selection, setEditing, setItems, setSelection])

  const moveSelection = useCallback(
    (dx: number, dy: number) => {
      setItems(
        (current) =>
          nudgeCanvasCommand({
            adapter: commandAdapter,
            config,
            dx,
            dy,
            items: current,
            selection,
          }) ?? current,
        {
          before: selection,
          after: selection,
        },
      )
    },
    [commandAdapter, config, selection, setItems],
  )

  const reorderSelection = useCallback(
    (mode: CanvasReorderMode) => {
      const result = reorderCanvasCommand({
        adapter: commandAdapter,
        config,
        items,
        mode,
        selection,
      })

      if (!result) {
        return
      }

      setItems(result.items, {
        before: selection,
        after: result.selection,
      })
      setSelection(result.selection)
    },
    [commandAdapter, config, items, selection, setItems, setSelection],
  )

  const selectAll = useCallback(() => {
    const nextSelection = selectAllCanvasCommand({
      adapter: commandAdapter,
      config,
      items,
    })

    if (!nextSelection) {
      return
    }

    setSelection(nextSelection)
  }, [commandAdapter, config, items, setSelection])

  return {
    cloneItems,
    copySelection,
    cutSelection,
    deleteSelection,
    duplicateSelection,
    groupSelection,
    lockSelection,
    moveSelection,
    pasteSelection,
    redoHistory,
    reorderSelection,
    selectAll,
    undoHistory,
    ungroupSelection,
    unlockAll,
  }
}

function getViewportCenter(
  svgRef: RefObject<SVGSVGElement | null>,
  viewport: Viewport,
): Point | null {
  const rect = svgRef.current?.getBoundingClientRect()

  if (!rect) {
    return null
  }

  return {
    x: (rect.width / 2 - viewport.x) / viewport.scale,
    y: (rect.height / 2 - viewport.y) / viewport.scale,
  }
}

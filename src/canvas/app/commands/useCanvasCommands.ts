import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import {
  alignCanvasCommand,
  deleteCanvasCommand,
  distributeCanvasCommand,
  groupCanvasCommand,
  lockCanvasCommand,
  nudgeCanvasCommand,
  reorderCanvasCommand,
  selectAllCanvasCommand,
  ungroupCanvasCommand,
  unlockAllCanvasCommand,
  type CanvasAlignMode,
  type CanvasCommandAdapter,
  type CanvasDistributeMode,
  type CanvasReorderMode,
} from '../../engine/command/CanvasCommandEngine'
import type { CanvasAffordanceConfig } from '../../engine/affordance/CanvasAffordances'
import type { Viewport } from '../../engine/primitives/CanvasPrimitives'
import type { CanvasItem, EditingText } from '../../host/model/CanvasModel'
import { createRemoveCanvasItemsPatch } from '../../host/document/CanvasDocumentPatches'
import { useCanvasClipboardCommands } from './useCanvasClipboardCommands'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItems,
  CommitCanvasItemsPatch,
} from '../document/useCanvasDocument'

type UseCanvasCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitItemsPatch: CommitCanvasItemsPatch
  config: CanvasAffordanceConfig
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  createId: (prefix: string) => string
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  redo: () => string[] | undefined
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  setItems: CommitCanvasItems
  setSelection: Dispatch<SetStateAction<string[]>>
  svgRef: RefObject<SVGSVGElement | null>
  undo: () => string[] | undefined
  viewport: Viewport
}

export function useCanvasCommands({
  commandAdapter,
  commitItemsPatch,
  config,
  copyItemsToClipboard,
  createId,
  getClipboardItems,
  items,
  redo,
  selection,
  setEditing,
  setClipboardItems,
  setItems,
  setSelection,
  svgRef,
  undo,
  viewport,
}: UseCanvasCommandsArgs) {
  const {
    cloneItems,
    copySelection,
    cutSelection,
    duplicateSelection,
    pasteSelection,
  } = useCanvasClipboardCommands({
    commandAdapter,
    commitItemsPatch,
    config,
    copyItemsToClipboard,
    createId,
    getClipboardItems,
    items,
    selection,
    setEditing,
    setClipboardItems,
    setItems,
    setSelection,
    svgRef,
    viewport,
  })

  const alignSelection = useCallback(
    (mode: CanvasAlignMode) => {
      const result = alignCanvasCommand({
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

  const distributeSelection = useCallback(
    (mode: CanvasDistributeMode) => {
      const result = distributeCanvasCommand({
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

    const patch = createRemoveCanvasItemsPatch(items, selection)

    if (patch.length > 0) {
      commitItemsPatch(patch, {
        before: selection,
        after: result.selection,
      })
    } else {
      setSelection(result.selection)
    }

    setEditing((current) =>
      current && result.clearEditingIds.includes(current.id) ? null : current,
    )
  }, [
    commandAdapter,
    commitItemsPatch,
    config,
    items,
    selection,
    setEditing,
    setSelection,
  ])

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
    alignSelection,
    cloneItems,
    copySelection,
    cutSelection,
    deleteSelection,
    distributeSelection,
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

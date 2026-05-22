import {
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  cloneCanvasItemsWithNewIds,
  cloneCanvasSelection,
  copyCanvasSelection,
  groupCanvasSelection,
  removeCanvasItems,
  translateCanvasItems,
  ungroupCanvasSelection,
} from './CanvasOperations'
import type { CanvasAffordanceConfig } from './CanvasAffordances'
import type {
  CanvasItem,
  EditingText,
  Point,
} from './CanvasModel'
import type { CommitCanvasItems } from './useCanvasHistory'

type UseCanvasCommandsArgs = {
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  redo: () => string[] | undefined
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setItems: CommitCanvasItems
  setSelection: Dispatch<SetStateAction<string[]>>
  undo: () => string[] | undefined
}

export function useCanvasCommands({
  config,
  createId,
  items,
  redo,
  selection,
  setEditing,
  setItems,
  setSelection,
  undo,
}: UseCanvasCommandsArgs) {
  const clipboardRef = useRef<CanvasItem[]>([])

  const cloneItems = useCallback(
    (ids: string[], offset: Point) =>
      cloneCanvasSelection(items, ids, createId, offset),
    [createId, items],
  )

  const duplicateSelection = useCallback(
    (sourceIds = selection, offset: Point = { x: 28, y: 28 }) => {
      if (!config.commands.duplicate) {
        return []
      }

      const clones = cloneItems(sourceIds, offset)

      if (clones.length === 0) {
        return []
      }

      const cloneIds = clones.map((item) => item.id)

      setItems([...items, ...clones], {
        before: selection,
        after: cloneIds,
      })
      setSelection(cloneIds)
      return clones
    },
    [cloneItems, config.commands.duplicate, items, selection, setItems, setSelection],
  )

  const copySelection = useCallback(() => {
    if (!config.commands.copy) {
      return
    }

    clipboardRef.current = copyCanvasSelection(items, selection)
  }, [config.commands.copy, items, selection])

  const pasteSelection = useCallback(() => {
    if (!config.commands.paste) {
      return
    }

    const clones = cloneCanvasItemsWithNewIds(
      clipboardRef.current,
      createId,
      { x: 28, y: 28 },
    )

    if (clones.length === 0) {
      return
    }

    clipboardRef.current = clones
    const cloneIds = clones.map((item) => item.id)

    setItems([...items, ...clones], {
      before: selection,
      after: cloneIds,
    })
    setSelection(cloneIds)
  }, [config.commands.paste, createId, items, selection, setItems, setSelection])

  const deleteSelection = useCallback(() => {
    if (!config.commands.delete || selection.length === 0) {
      return
    }

    setItems((current) => removeCanvasItems(current, selection), {
      before: selection,
      after: [],
    })
    setEditing((current) =>
      current && selection.includes(current.id) ? null : current,
    )
    setSelection([])
  }, [config.commands.delete, selection, setEditing, setItems, setSelection])

  const groupSelection = useCallback(() => {
    if (!config.commands.group || selection.length < 2) {
      return
    }

    const result = groupCanvasSelection(items, selection, createId('group'))

    if (result.items === items) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [config.commands.group, createId, items, selection, setItems, setSelection])

  const ungroupSelection = useCallback(() => {
    if (!config.commands.ungroup) {
      return
    }

    const result = ungroupCanvasSelection(items, selection)

    if (result.selection.length === 0) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [config.commands.ungroup, items, selection, setItems, setSelection])

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
    if (!config.commands.cut) {
      return
    }

    copySelection()
    deleteSelection()
  }, [config.commands.cut, copySelection, deleteSelection])

  const moveSelection = useCallback(
    (dx: number, dy: number) => {
      if (!config.commands.nudge) {
        return
      }

      setItems((current) => translateCanvasItems(current, selection, dx, dy))
    },
    [config.commands.nudge, selection, setItems],
  )

  return {
    cloneItems,
    copySelection,
    cutSelection,
    deleteSelection,
    duplicateSelection,
    groupSelection,
    moveSelection,
    pasteSelection,
    redoHistory,
    undoHistory,
    ungroupSelection,
  }
}

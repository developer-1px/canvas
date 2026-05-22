import {
  useCallback,
  useRef,
  type Dispatch,
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
  nudgeCanvasCommand,
  pasteCanvasCommand,
  ungroupCanvasCommand,
} from './CanvasCommandEngine'
import type { CanvasAffordanceConfig } from './CanvasAffordances'
import type { CanvasItem, EditingText, Point } from './CanvasModel'
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
      cloneCanvasCommandItems({ createId, ids, items, offset }),
    [createId, items],
  )

  const duplicateSelection = useCallback(
    (sourceIds = selection, offset: Point = CANVAS_COMMAND_INSERT_OFFSET) => {
      const result = duplicateCanvasCommand({
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
    [config, createId, items, selection, setItems, setSelection],
  )

  const copySelection = useCallback(() => {
    const clipboard = copyCanvasCommand({ config, items, selection })

    if (!clipboard) {
      return
    }

    clipboardRef.current = clipboard
  }, [config, items, selection])

  const pasteSelection = useCallback(() => {
    const result = pasteCanvasCommand({
      clipboard: clipboardRef.current,
      config,
      createId,
      items,
    })

    if (!result) {
      return
    }

    clipboardRef.current = result.clipboard
    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [config, createId, items, selection, setItems, setSelection])

  const deleteSelection = useCallback(() => {
    const result = deleteCanvasCommand({ config, items, selection })

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
  }, [config, items, selection, setEditing, setItems, setSelection])

  const groupSelection = useCallback(() => {
    const result = groupCanvasCommand({ config, createId, items, selection })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [config, createId, items, selection, setItems, setSelection])

  const ungroupSelection = useCallback(() => {
    const result = ungroupCanvasCommand({ config, items, selection })

    if (!result) {
      return
    }

    setItems(result.items, {
      before: selection,
      after: result.selection,
    })
    setSelection(result.selection)
  }, [config, items, selection, setItems, setSelection])

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
    const result = cutCanvasCommand({ config, items, selection })

    if (!result) {
      return
    }

    if (result.clipboard) {
      clipboardRef.current = result.clipboard
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
  }, [config, items, selection, setEditing, setItems, setSelection])

  const moveSelection = useCallback(
    (dx: number, dy: number) => {
      setItems((current) =>
        nudgeCanvasCommand({
          config,
          dx,
          dy,
          items: current,
          selection,
        }) ?? current,
      )
    },
    [config, selection, setItems],
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

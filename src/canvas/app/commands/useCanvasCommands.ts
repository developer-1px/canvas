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
  type CanvasAffordanceConfig,
  type CanvasAlignMode,
  type CanvasCommandAdapter,
  type CanvasDistributeMode,
  type CanvasReorderMode,
} from '../../engine'
import type { Viewport } from '../../core'
import type {
  CanvasItem,
  EditingText,
} from '../../host'
import { useCanvasClipboardCommands } from './useCanvasClipboardCommands'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

type UseCanvasCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  createId: (prefix: string) => string
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  redo: () => string[] | undefined
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  setSelection: Dispatch<SetStateAction<string[]>>
  svgRef: RefObject<SVGSVGElement | null>
  undo: () => string[] | undefined
  viewport: Viewport
}

export function useCanvasCommands({
  commandAdapter,
  commitSelection,
  commitItemsChange,
  config,
  copyItemsToClipboard,
  createId,
  getClipboardItems,
  items,
  redo,
  selection,
  setEditing,
  setClipboardItems,
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
    commitItemsChange,
    config,
    copyItemsToClipboard,
    createId,
    getClipboardItems,
    items,
    selection,
    setEditing,
    setClipboardItems,
    svgRef,
    viewport,
    commitSelection,
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

      commitItemsChange({ type: 'replace-changed', items: result.items }, {
        before: selection,
        after: result.selection,
      })
    },
    [commandAdapter, commitItemsChange, config, items, selection],
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

      commitItemsChange({ type: 'replace-changed', items: result.items }, {
        before: selection,
        after: result.selection,
      })
    },
    [commandAdapter, commitItemsChange, config, items, selection],
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

    const didCommit = commitItemsChange(
      { type: 'remove-selection', selection },
      {
        before: selection,
        after: result.selection,
      },
    )

    if (!didCommit) {
      commitSelection(result.selection)
    }

    setEditing((current) =>
      current && result.clearEditingIds.includes(current.id) ? null : current,
    )
  }, [
    commandAdapter,
    commitSelection,
    commitItemsChange,
    config,
    items,
    selection,
    setEditing,
  ])

  const groupSelection = useCallback(() => {
    const groupId = createId('group')
    const result = groupCanvasCommand({
      adapter: commandAdapter,
      config,
      createId: () => groupId,
      items,
      selection,
    })

    if (!result) {
      return
    }

    const didCommit = commitItemsChange(
      { type: 'group-selection', groupId, selection },
      {
        before: selection,
        after: result.selection,
      },
    )

    if (!didCommit) {
      commitSelection(result.selection)
    }
  }, [
    commandAdapter,
    commitItemsChange,
    commitSelection,
    config,
    createId,
    items,
    selection,
  ])

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

    const didCommit = commitItemsChange(
      { type: 'ungroup-selection', selection },
      {
        before: selection,
        after: result.selection,
      },
    )

    if (!didCommit) {
      commitSelection(result.selection)
    }
  }, [commandAdapter, commitItemsChange, commitSelection, config, items, selection])

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

    const didCommit = commitItemsChange(
      { type: 'replace-changed', items: result.items },
      {
        before: selection,
        after: result.selection,
      },
    )

    if (!didCommit) {
      commitSelection(result.selection)
    }
  }, [commandAdapter, commitItemsChange, commitSelection, config, items, selection])

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

    const didCommit = commitItemsChange(
      { type: 'replace-changed', items: result.items },
      {
        before: selection,
        after: result.selection,
      },
    )

    if (!didCommit) {
      commitSelection(result.selection)
    }
  }, [commandAdapter, commitItemsChange, commitSelection, config, items, selection])

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
      const result = nudgeCanvasCommand({
        adapter: commandAdapter,
        config,
        dx,
        dy,
        items,
        selection,
      })

      if (!result) {
        return
      }

      commitItemsChange(
        { type: 'replace-changed', items: result },
        {
          before: selection,
          after: selection,
        },
      )
    },
    [commandAdapter, commitItemsChange, config, items, selection],
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

      commitItemsChange({ type: 'reorder-selection', mode, selection }, {
        before: selection,
        after: result.selection,
      })
    },
    [commandAdapter, commitItemsChange, config, items, selection],
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

    commitSelection(nextSelection)
  }, [commandAdapter, commitSelection, config, items])

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

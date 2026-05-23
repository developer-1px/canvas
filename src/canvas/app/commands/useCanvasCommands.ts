import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasAlignMode,
  CanvasCommandAdapter,
  CanvasDistributeMode,
  CanvasReorderMode,
} from '../../engine'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import {
  executeCanvasStandardCommand,
  type CanvasStandardCommand,
} from './CanvasStandardCommandExecution'
import { useCanvasClipboardCommands } from './useCanvasClipboardCommands'

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
  stageElement: CanvasAppStageElement
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
  stageElement,
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
    stageElement,
    viewport,
    commitSelection,
  })

  const runStandardCommand = useCallback(
    (command: CanvasStandardCommand) => {
      executeCanvasStandardCommand({
        command,
        context: {
          commandAdapter,
          commitItemsChange,
          commitSelection,
          config,
          createId,
          items,
          redo,
          selection,
          setEditing,
          setSelection,
          undo,
        },
      })
    },
    [
      commandAdapter,
      commitItemsChange,
      commitSelection,
      config,
      createId,
      items,
      redo,
      selection,
      setEditing,
      setSelection,
      undo,
    ],
  )

  const alignSelection = useCallback(
    (mode: CanvasAlignMode) => {
      runStandardCommand({ kind: 'align', mode })
    },
    [runStandardCommand],
  )

  const distributeSelection = useCallback(
    (mode: CanvasDistributeMode) => {
      runStandardCommand({ kind: 'distribute', mode })
    },
    [runStandardCommand],
  )

  const deleteSelection = useCallback(() => {
    runStandardCommand({ kind: 'delete' })
  }, [runStandardCommand])

  const groupSelection = useCallback(() => {
    runStandardCommand({ kind: 'group' })
  }, [runStandardCommand])

  const ungroupSelection = useCallback(() => {
    runStandardCommand({ kind: 'ungroup' })
  }, [runStandardCommand])

  const lockSelection = useCallback(() => {
    runStandardCommand({ kind: 'lock' })
  }, [runStandardCommand])

  const unlockAll = useCallback(() => {
    runStandardCommand({ kind: 'unlock-all' })
  }, [runStandardCommand])

  const undoHistory = useCallback(() => {
    runStandardCommand({ kind: 'undo' })
  }, [runStandardCommand])

  const redoHistory = useCallback(() => {
    runStandardCommand({ kind: 'redo' })
  }, [runStandardCommand])

  const moveSelection = useCallback(
    (dx: number, dy: number) => {
      runStandardCommand({ dx, dy, kind: 'nudge' })
    },
    [runStandardCommand],
  )

  const reorderSelection = useCallback(
    (mode: CanvasReorderMode) => {
      runStandardCommand({ kind: 'reorder', mode })
    },
    [runStandardCommand],
  )

  const selectAll = useCallback(() => {
    runStandardCommand({ kind: 'select-all' })
  }, [runStandardCommand])

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

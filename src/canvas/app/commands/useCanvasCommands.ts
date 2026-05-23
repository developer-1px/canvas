import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasCommandAdapter,
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
import { getCanvasStandardCommandHandlers } from './CanvasStandardCommandHandlers'
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

  const standardCommandHandlers = useMemo(
    () => getCanvasStandardCommandHandlers(runStandardCommand),
    [runStandardCommand],
  )

  return {
    cloneItems,
    copySelection,
    cutSelection,
    duplicateSelection,
    pasteSelection,
    ...standardCommandHandlers,
  }
}

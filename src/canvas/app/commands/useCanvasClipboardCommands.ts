import {
  useCallback,
  useMemo,
  useRef,
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
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import {
  executeCanvasClipboardCommand,
  type CanvasClipboardCommand,
} from './CanvasClipboardCommandExecution'
import { getCanvasClipboardCommandHandlers } from './CanvasClipboardCommandHandlers'

type UseCanvasClipboardCommandsArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  commitSelection: CommitCanvasSelection
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  createId: (prefix: string) => string
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export function useCanvasClipboardCommands({
  commandAdapter,
  commitSelection,
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
}: UseCanvasClipboardCommandsArgs) {
  const pasteIndexRef = useRef(0)
  const getPasteIndex = useCallback(() => pasteIndexRef.current, [])

  const runClipboardCommand = useCallback(
    (command: CanvasClipboardCommand) => {
      const result = executeCanvasClipboardCommand({
        command,
        context: {
          commandAdapter,
          commitItemsChange,
          commitSelection,
          config,
          copyItemsToClipboard,
          createId,
          getClipboardItems,
          items,
          selection,
          setClipboardItems,
          setEditing,
          stageElement,
          viewport,
        },
      })

      if (result.nextPasteIndex !== undefined) {
        pasteIndexRef.current = result.nextPasteIndex
      }

      return result.clonedItems
    },
    [
      commandAdapter,
      commitItemsChange,
      commitSelection,
      config,
      copyItemsToClipboard,
      createId,
      getClipboardItems,
      items,
      selection,
      setClipboardItems,
      setEditing,
      stageElement,
      viewport,
    ],
  )

  return useMemo(
    () =>
      getCanvasClipboardCommandHandlers({
        getPasteIndex,
        runClipboardCommand,
        selection,
      }),
    [getPasteIndex, runClipboardCommand, selection],
  )
}

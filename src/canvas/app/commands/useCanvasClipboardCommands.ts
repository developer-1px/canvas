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
  Point,
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
import {
  cloneCanvasClipboardItems,
  copyCanvasClipboardSelection,
  cutCanvasClipboardSelection,
  duplicateCanvasClipboardSelection,
  pasteCanvasClipboardSelection,
} from './CanvasClipboardCommandHandlers'

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

  const cloneItems = useCallback(
    (ids: string[], offset: Point) =>
      cloneCanvasClipboardItems({
        ids,
        offset,
        runClipboardCommand,
      }),
    [runClipboardCommand],
  )

  const copySelection = useCallback(() => {
    copyCanvasClipboardSelection({
      pasteIndex: pasteIndexRef.current,
      runClipboardCommand,
    })
  }, [runClipboardCommand])

  const cutSelection = useCallback(() => {
    cutCanvasClipboardSelection({
      pasteIndex: pasteIndexRef.current,
      runClipboardCommand,
    })
  }, [runClipboardCommand])

  const duplicateSelection = useCallback(
    (sourceIds?: string[], offset?: Point) =>
      duplicateCanvasClipboardSelection({
        offset,
        runClipboardCommand,
        selection,
        sourceIds,
      }),
    [runClipboardCommand, selection],
  )

  const pasteSelection = useCallback(() => {
    pasteCanvasClipboardSelection({
      pasteIndex: pasteIndexRef.current,
      runClipboardCommand,
    })
  }, [runClipboardCommand])

  return useMemo(
    () => ({
      cloneItems,
      copySelection,
      cutSelection,
      duplicateSelection,
      pasteSelection,
    }),
    [
      cloneItems,
      copySelection,
      cutSelection,
      duplicateSelection,
      pasteSelection,
    ],
  )
}

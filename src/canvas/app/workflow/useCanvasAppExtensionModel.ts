import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
  type CanvasAppCustomCommandState,
} from '../commands/CanvasAppCustomCommandExecution'
import type {
  CanvasAppCustomCommand,
  CanvasAppCustomCommandContext,
} from '../commands/CanvasAppCustomCommands'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import {
  getCanvasAppCustomCreationToolStates,
  type CanvasAppCustomCreationToolState,
} from '../tools/CanvasAppCustomCreationToolRuntime'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

type UseCanvasAppExtensionModelArgs = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  createId: (prefix: string) => string
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export type CanvasAppExtensionModel = {
  control: {
    customCommands: CanvasAppCustomCommandState[]
    customTools: CanvasAppCustomCreationToolState[]
    onRunCustomCommand: (commandId: string) => boolean
  }
  keyboard: {
    customCreationTools: CanvasAppCustomCreationToolState[]
  }
  pointer: {
    customCreationTools: readonly CanvasAppCustomCreationTool[]
  }
}

export function useCanvasAppExtensionModel({
  commitItemsChange,
  commitSelection,
  createId,
  customCommands,
  customCreationTools,
  items,
  selection,
  setEditing,
  viewport,
}: UseCanvasAppExtensionModelArgs): CanvasAppExtensionModel {
  const customCommandContext = useMemo<CanvasAppCustomCommandContext>(
    () => ({
      commitItemsChange,
      commitSelection,
      createId,
      items,
      selection,
      setEditing,
      viewport,
    }),
    [
      commitItemsChange,
      commitSelection,
      createId,
      items,
      selection,
      setEditing,
      viewport,
    ],
  )
  const customCommandStates = useMemo(
    () =>
      getCanvasAppCustomCommandStates({
        commands: customCommands,
        context: customCommandContext,
      }),
    [customCommandContext, customCommands],
  )
  const customCreationToolStates = useMemo(
    () => getCanvasAppCustomCreationToolStates(customCreationTools),
    [customCreationTools],
  )
  const runCustomCommand = useCallback(
    (commandId: string) =>
      runCanvasAppCustomCommand({
        commandId,
        commands: customCommands,
        context: customCommandContext,
      }),
    [customCommandContext, customCommands],
  )

  return {
    control: {
      customCommands: customCommandStates,
      customTools: customCreationToolStates,
      onRunCustomCommand: runCustomCommand,
    },
    keyboard: {
      customCreationTools: customCreationToolStates,
    },
    pointer: {
      customCreationTools,
    },
  }
}

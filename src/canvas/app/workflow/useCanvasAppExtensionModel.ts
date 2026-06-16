import {
  useCallback,
  useMemo,
} from 'react'
import {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
} from '../extensions/custom-commands'
import type {
  CanvasAppCustomCommandContext,
} from '../extensions/custom-commands'
import {
  getCanvasAppCustomCreationToolStates,
} from '../extensions/custom-tools/CanvasAppCustomCreationToolRuntime'
import {
  getCanvasAppExtensionConsumerModel,
} from './CanvasAppExtensionConsumerModel'
import type {
  CanvasAppExtensionModel,
  CanvasAppExtensionModelInput,
} from './CanvasAppExtensionConsumerContracts'

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
}: CanvasAppExtensionModelInput): CanvasAppExtensionModel {
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

  return getCanvasAppExtensionConsumerModel({
    customCommandStates,
    customCreationToolStates,
    customCreationTools,
    runCustomCommand,
  })
}

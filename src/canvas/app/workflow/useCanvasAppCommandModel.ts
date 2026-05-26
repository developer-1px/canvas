import { useCanvasCommands } from '../affordances/commands/useCanvasCommands'
import { getCanvasAppCommandConsumerModel } from './CanvasAppCommandConsumerModel'
import type { CanvasAppCommandModelInput } from './CanvasAppCommandConsumerContracts'

export function useCanvasAppCommandModel({
  commandAdapter,
  config,
  createId,
  document,
  setEditing,
  stageElement,
  workspace,
}: CanvasAppCommandModelInput) {
  const commands = useCanvasCommands({
    commandAdapter,
    commitItemsChange: document.commitItemsChange,
    commitSelection: document.commitSelection,
    config,
    copyItemsToClipboard: document.copyItemsToClipboard,
    createId,
    getClipboardItems: document.getClipboardItems,
    items: workspace.items,
    redo: document.redo,
    selection: workspace.selection,
    setClipboardItems: document.setClipboardItems,
    setEditing,
    setSelection: workspace.setSelection,
    stageElement,
    undo: document.undo,
    viewport: workspace.viewport,
  })

  return getCanvasAppCommandConsumerModel(commands)
}

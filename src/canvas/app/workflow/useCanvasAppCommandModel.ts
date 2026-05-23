import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
  CanvasAlignMode,
  CanvasAffordanceConfig,
  CanvasCommandAdapter,
  CanvasDistributeMode,
} from '../../engine'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import { useCanvasCommands } from '../commands/useCanvasCommands'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from './CanvasWorkflowContract'

type CanvasAppCommandDocumentModel = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  getClipboardItems: CanvasDocumentClipboard['getClipboardItems']
  redo: () => string[] | undefined
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  undo: () => string[] | undefined
}

type CanvasAppCommandWorkspaceModel = {
  items: CanvasItem[]
  selection: string[]
  setSelection: Dispatch<SetStateAction<string[]>>
  viewport: Viewport
}

type UseCanvasAppCommandModelArgs = {
  commandAdapter: CanvasCommandAdapter<CanvasItem>
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  document: CanvasAppCommandDocumentModel
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  stageElement: CanvasAppStageElement
  workspace: CanvasAppCommandWorkspaceModel
}

type CanvasAppCommandControlHandlers = {
  onAlign: (mode: CanvasAlignMode) => void
  onDelete: () => void
  onDistribute: (mode: CanvasDistributeMode) => void
  onDuplicate: () => void
  onGroup: () => void
  onLock: () => void
  onRedo: () => void
  onUndo: () => void
  onUngroup: () => void
  onUnlockAll: () => void
}

export function useCanvasAppCommandModel({
  commandAdapter,
  config,
  createId,
  document,
  setEditing,
  stageElement,
  workspace,
}: UseCanvasAppCommandModelArgs) {
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

  return {
    control: {
      commandHandlers: {
        onAlign: commands.alignSelection,
        onDelete: commands.deleteSelection,
        onDistribute: commands.distributeSelection,
        onDuplicate: commands.duplicateSelection,
        onGroup: commands.groupSelection,
        onLock: commands.lockSelection,
        onRedo: commands.redoHistory,
        onUndo: commands.undoHistory,
        onUngroup: commands.ungroupSelection,
        onUnlockAll: commands.unlockAll,
      } satisfies CanvasAppCommandControlHandlers,
    },
    keyboard: {
      copySelection: commands.copySelection,
      cutSelection: commands.cutSelection,
      deleteSelection: commands.deleteSelection,
      duplicateSelection: commands.duplicateSelection,
      groupSelection: commands.groupSelection,
      lockSelection: commands.lockSelection,
      moveSelection: commands.moveSelection,
      pasteSelection: commands.pasteSelection,
      redoHistory: commands.redoHistory,
      reorderSelection: commands.reorderSelection,
      selectAll: commands.selectAll,
      undoHistory: commands.undoHistory,
      ungroupSelection: commands.ungroupSelection,
      unlockAll: commands.unlockAll,
    },
    pointer: {
      cloneItems: commands.cloneItems,
    },
  }
}

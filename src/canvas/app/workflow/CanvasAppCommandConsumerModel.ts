import type { CanvasAppControlCommandHandlers } from './CanvasAppControlCommandContracts'
import type {
  CanvasAppCommandConsumerModel,
  CanvasAppCommandRuntime,
} from './CanvasAppCommandConsumerContracts'

export function getCanvasAppCommandConsumerModel(
  commands: CanvasAppCommandRuntime,
): CanvasAppCommandConsumerModel {
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
      } satisfies CanvasAppControlCommandHandlers,
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

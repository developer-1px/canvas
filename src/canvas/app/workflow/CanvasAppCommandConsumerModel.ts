import type {
  CanvasAlignMode,
  CanvasDistributeMode,
  CanvasReorderMode,
} from '../../engine'
import type {
  CanvasItem,
  Point,
} from '../../entities'

type CanvasAppCommandRuntime = {
  alignSelection: (mode: CanvasAlignMode) => void
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  distributeSelection: (mode: CanvasDistributeMode) => void
  duplicateSelection: (sourceIds?: string[], offset?: Point) => CanvasItem[]
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
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

export function getCanvasAppCommandConsumerModel(
  commands: CanvasAppCommandRuntime,
) {
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

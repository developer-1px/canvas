import type {
  CanvasAlignMode,
  CanvasDistributeMode,
  CanvasReorderMode,
} from '../../engine'
import type { CanvasStandardCommand } from './CanvasStandardCommandContracts'

export type RunCanvasStandardCommand = (command: CanvasStandardCommand) => void

export type CanvasStandardCommandHandlers = {
  alignSelection: (mode: CanvasAlignMode) => void
  deleteSelection: () => void
  distributeSelection: (mode: CanvasDistributeMode) => void
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export function getCanvasStandardCommandHandlers(
  runStandardCommand: RunCanvasStandardCommand,
): CanvasStandardCommandHandlers {
  return {
    alignSelection: (mode) => {
      runStandardCommand({ kind: 'align', mode })
    },
    deleteSelection: () => {
      runStandardCommand({ kind: 'delete' })
    },
    distributeSelection: (mode) => {
      runStandardCommand({ kind: 'distribute', mode })
    },
    groupSelection: () => {
      runStandardCommand({ kind: 'group' })
    },
    lockSelection: () => {
      runStandardCommand({ kind: 'lock' })
    },
    moveSelection: (dx, dy) => {
      runStandardCommand({ dx, dy, kind: 'nudge' })
    },
    redoHistory: () => {
      runStandardCommand({ kind: 'redo' })
    },
    reorderSelection: (mode) => {
      runStandardCommand({ kind: 'reorder', mode })
    },
    selectAll: () => {
      runStandardCommand({ kind: 'select-all' })
    },
    undoHistory: () => {
      runStandardCommand({ kind: 'undo' })
    },
    ungroupSelection: () => {
      runStandardCommand({ kind: 'ungroup' })
    },
    unlockAll: () => {
      runStandardCommand({ kind: 'unlock-all' })
    },
  }
}

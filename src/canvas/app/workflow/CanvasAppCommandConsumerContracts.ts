import type {
  CanvasAlignMode,
  CanvasDistributeMode,
  CanvasReorderMode,
} from '../../engine'
import type {
  CanvasItem,
  Point,
} from '../../entities'
import type { CanvasAppControlCommandHandlers } from './CanvasAppControlCommandContracts'

export type CanvasAppCommandRuntime = {
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

export type CanvasAppCommandControlContext = {
  commandHandlers: CanvasAppControlCommandHandlers
}

export type CanvasAppCommandKeyboardContext = {
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
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

export type CanvasAppCommandPointerContext = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
}

export type CanvasAppCommandConsumerModel = {
  control: CanvasAppCommandControlContext
  keyboard: CanvasAppCommandKeyboardContext
  pointer: CanvasAppCommandPointerContext
}

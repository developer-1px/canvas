import type {
  CanvasAlignMode,
  CanvasDistributeMode,
} from '../../../../engine'

export type CanvasToolbarCommandHandlers = {
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

import type {
  CanvasAlignMode,
  CanvasDistributeMode,
  CanvasReorderMode,
} from '../../engine'

export type CanvasStandardCommand =
  | { kind: 'align'; mode: CanvasAlignMode }
  | { kind: 'distribute'; mode: CanvasDistributeMode }
  | { kind: 'delete' }
  | { kind: 'group' }
  | { kind: 'ungroup' }
  | { kind: 'lock' }
  | { kind: 'unlock-all' }
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { dx: number; dy: number; kind: 'nudge' }
  | { kind: 'reorder'; mode: CanvasReorderMode }
  | { kind: 'select-all' }

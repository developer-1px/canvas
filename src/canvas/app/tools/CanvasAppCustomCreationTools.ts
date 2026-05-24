import type {
  CanvasCustomItem,
  Point,
} from '../../entities'

export type CanvasAppCustomToolShortcut = {
  key: string
  shiftKey?: boolean
}

export type CanvasAppCustomCreationToolContext = {
  createId: (prefix: string) => string
  currentWorld: Point
  moved: boolean
  startWorld: Point
}

export type CanvasAppCustomCreationTool = {
  ariaLabel?: string
  createItem: (
    context: CanvasAppCustomCreationToolContext,
  ) => CanvasCustomItem | null
  id: string
  label: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
  title: string
}

export {
  assertCanvasAppCustomCreationToolShortcuts,
  assertCanvasAppCustomCreationTools,
} from './CanvasAppCustomCreationToolContracts'

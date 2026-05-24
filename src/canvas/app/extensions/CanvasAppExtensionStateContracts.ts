import type { CanvasCustomToolId } from '../../entities'
import type {
  CanvasAppCustomToolShortcut,
} from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppCustomCommandState = {
  ariaLabel: string
  disabled: boolean
  id: string
  label: string
  title: string
}

export type CanvasAppCustomCreationToolState = {
  ariaLabel: string
  id: CanvasCustomToolId
  label: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel: string
  title: string
}

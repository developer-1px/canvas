import type { CanvasCustomToolId } from '../../entities'
import type {
  CanvasAppCustomCommandShortcut,
} from './custom-commands/CanvasAppCustomCommands'
import type {
  CanvasAppCustomToolShortcut,
} from './custom-tools/CanvasAppCustomCreationTools'

export type CanvasAppCustomCommandState = {
  ariaLabel: string
  disabled: boolean
  id: string
  label: string
  shortcut?: CanvasAppCustomCommandShortcut
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

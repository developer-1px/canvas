import type {
  CanvasCustomItem,
  Point,
} from '../../../entities'
import type { CanvasAppCapability } from '../../CanvasAppCapabilityContracts'

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
  enterTextEdit?: boolean
  id: string
  label: string
  requiredCapability: CanvasAppCapability
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
  title: string
}

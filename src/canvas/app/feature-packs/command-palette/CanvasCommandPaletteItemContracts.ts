import type {
  CanvasAffordanceConfig,
  CanvasCommandAvailability,
} from '../../../engine'
import type { CanvasViewportZoomDirection } from '../../../core'
import type {
  CanvasComponentKind,
  Tool,
} from '../../../entities'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../../extensions/CanvasAppExtensionStateContracts'
import type {
  CanvasToolbarCommandHandlers,
} from '../toolbar/CanvasToolbarCommandContracts'

export const CANVAS_COMMAND_PALETTE_ITEMS_MODEL =
  'canvas-command-palette-items'

export type CanvasCommandPaletteItem = {
  disabled?: boolean
  id: string
  section: string
  shortcut?: string
  title: string
  onSelect: () => void
}

export type CanvasCommandPaletteComponent = {
  id: CanvasComponentKind
  title: string
}

export type CanvasCommandPaletteItemsInput = {
  commandAvailability: CanvasCommandAvailability
  commandHandlers: CanvasToolbarCommandHandlers
  components: readonly CanvasCommandPaletteComponent[]
  config: CanvasAffordanceConfig
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  selection: readonly string[]
  onCustomCommand: (commandId: string) => void
  onFitItems: (ids?: string[]) => void
  onInsertComponent: (component: CanvasComponentKind) => void
  onOpenShortcutHelp: () => void
  onToolChange: (tool: Tool) => void
  onViewportReset: () => void
  onZoom: (direction: CanvasViewportZoomDirection) => void
}

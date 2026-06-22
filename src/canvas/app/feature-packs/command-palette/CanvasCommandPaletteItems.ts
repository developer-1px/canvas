import {
  getCanvasCommandPaletteCommandItems,
  getCanvasCommandPaletteCustomCommandItems,
} from './CanvasCommandPaletteCommandItems'
import {
  getCanvasCommandPaletteComponentItems,
} from './CanvasCommandPaletteComponentItems'
import {
  getCanvasCommandPaletteSystemItems,
} from './CanvasCommandPaletteSystemItems'
import {
  getCanvasCommandPaletteToolItems,
} from './CanvasCommandPaletteToolItems'
import {
  getCanvasCommandPaletteViewportItems,
} from './CanvasCommandPaletteViewportItems'
import type {
  CanvasCommandPaletteItem,
  CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'

export {
  CANVAS_COMMAND_PALETTE_ITEMS_MODEL,
  type CanvasCommandPaletteComponent,
  type CanvasCommandPaletteItem,
  type CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'
export {
  filterCanvasCommandPaletteItems,
} from './CanvasCommandPaletteItemFilter'

export function getCanvasCommandPaletteItems({
  commandAvailability,
  commandHandlers,
  components,
  config,
  customCommands,
  customTools,
  onCustomCommand,
  onFitItems,
  onInsertComponent,
  onOpenShortcutHelp,
  onToolChange,
  onViewportReset,
  onZoom,
  selection,
}: CanvasCommandPaletteItemsInput): CanvasCommandPaletteItem[] {
  return [
    ...getCanvasCommandPaletteToolItems({
      config,
      customTools,
      onToolChange,
    }),
    ...getCanvasCommandPaletteComponentItems({
      components,
      onInsertComponent,
    }),
    ...getCanvasCommandPaletteCommandItems({
      commandAvailability,
      commandHandlers,
      config,
    }),
    ...getCanvasCommandPaletteCustomCommandItems({
      customCommands,
      onCustomCommand,
    }),
    ...getCanvasCommandPaletteSystemItems({
      config,
      onOpenShortcutHelp,
    }),
    ...getCanvasCommandPaletteViewportItems({
      config,
      onFitItems,
      onViewportReset,
      onZoom,
      selection,
    }),
  ]
}

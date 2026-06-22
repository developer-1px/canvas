import {
  CANVAS_COMMAND_AFFORDANCES,
} from '../../../engine'
import {
  getCanvasAppCommandMapping,
  getCanvasAppCommandMappingShortcut,
} from '../../affordances/commands/CanvasAppCommandRegistry'
import type {
  CanvasCommandPaletteItem,
  CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'

export function getCanvasCommandPaletteViewportItems({
  config,
  onFitItems,
  onViewportReset,
  onZoom,
  selection,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'config' | 'onFitItems' | 'onViewportReset' | 'onZoom' | 'selection'
>): CanvasCommandPaletteItem[] {
  const items: CanvasCommandPaletteItem[] = []

  if (config.commands.fitView) {
    items.push({
      id: 'viewport:fit',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:fit'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.fitView.title,
      onSelect: () =>
        onFitItems(selection.length > 0 ? [...selection] : undefined),
    })
  }

  if (config.commands.zoomReset) {
    items.push({
      id: 'viewport:reset-zoom',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:reset-zoom'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.zoomReset.title,
      onSelect: onViewportReset,
    })
  }

  if (config.commands.zoomIn) {
    items.push({
      id: 'viewport:zoom-in',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:zoom-in'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.zoomIn.title,
      onSelect: () => onZoom('in'),
    })
  }

  if (config.commands.zoomOut) {
    items.push({
      id: 'viewport:zoom-out',
      section: 'View',
      shortcut: getCanvasAppCommandMappingShortcut({
        config,
        mapping: getCanvasAppCommandMapping('viewport:zoom-out'),
      }),
      title: CANVAS_COMMAND_AFFORDANCES.zoomOut.title,
      onSelect: () => onZoom('out'),
    })
  }

  return items
}

import {
  getCanvasAppCommandMapping,
  getCanvasAppCommandMappingShortcut,
} from '../../affordances/commands/CanvasAppCommandRegistry'
import type {
  CanvasCommandPaletteItem,
  CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'

export function getCanvasCommandPaletteSystemItems({
  config,
  onOpenShortcutHelp,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'config' | 'onOpenShortcutHelp'
>): CanvasCommandPaletteItem[] {
  if (!config.overlays.shortcutHelp) {
    return []
  }

  return [{
    id: 'system:shortcut-help',
    section: 'System',
    shortcut: getCanvasAppCommandMappingShortcut({
      config,
      mapping: getCanvasAppCommandMapping('system:shortcutHelp'),
    }),
    title: 'Keyboard shortcuts',
    onSelect: onOpenShortcutHelp,
  }]
}

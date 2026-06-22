import {
  CANVAS_TOOL_AFFORDANCE_ORDER,
  CANVAS_TOOL_AFFORDANCES,
} from '../../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../../extensions/CanvasAppExtensionStateContracts'
import type {
  CanvasCommandPaletteItem,
  CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItemContracts'

export function getCanvasCommandPaletteToolItems({
  config,
  customTools,
  onToolChange,
}: Pick<
  CanvasCommandPaletteItemsInput,
  'config' | 'customTools' | 'onToolChange'
>): CanvasCommandPaletteItem[] {
  return [
    ...CANVAS_TOOL_AFFORDANCE_ORDER
      .filter((tool) => config.tools[tool])
      .map((tool) => {
        const affordance = CANVAS_TOOL_AFFORDANCES[tool]

        return {
          id: `tool:${tool}`,
          section: 'Tools',
          shortcut: affordance.shortcut,
          title: getCanvasCommandPaletteTitle(affordance.title),
          onSelect: () => onToolChange(tool),
        } satisfies CanvasCommandPaletteItem
      }),
    ...customTools.map((tool) => ({
      id: `tool:${tool.id}`,
      section: 'Tools',
      shortcut: formatCanvasCommandPaletteShortcut(tool.shortcut),
      title: tool.title,
      onSelect: () => onToolChange(tool.id),
    })),
  ]
}

function formatCanvasCommandPaletteShortcut(
  shortcut: CanvasAppCustomCreationToolState['shortcut'],
) {
  if (!shortcut) {
    return undefined
  }

  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key

  return shortcut.shiftKey ? `Shift+${key}` : key
}

function getCanvasCommandPaletteTitle(title: string) {
  return title.replace(/\s+\(.+\)$/, '')
}

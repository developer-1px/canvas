import type { CanvasAffordanceConfig } from '../../engine'
import type { Tool } from '../../entities'
import {
  matchesCanvasAppCustomToolShortcut,
  type CanvasAppCustomCreationToolState,
} from '../tools/CanvasAppCustomCreationToolRuntime'

export type CanvasKeyboardToolShortcutIntentInput = {
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  event: globalThis.KeyboardEvent
  key: string
}

export function getCanvasKeyboardToolShortcutIntent({
  config,
  customCreationTools,
  event,
  key,
}: CanvasKeyboardToolShortcutIntentInput): Tool | null {
  if (config.shortcuts.selectTool && config.tools.select && key === 'v') {
    return 'select'
  }

  if (config.shortcuts.panTool && config.tools.pan && key === 'h') {
    return 'pan'
  }

  if (
    config.shortcuts.highlighterTool &&
    config.tools.highlight &&
    event.shiftKey &&
    key === 'm'
  ) {
    return 'highlight'
  }

  if (
    config.shortcuts.markerTool &&
    config.tools.marker &&
    !event.shiftKey &&
    key === 'm'
  ) {
    return 'marker'
  }

  if (config.shortcuts.arrowTool && config.tools.arrow && key === 'l') {
    return 'arrow'
  }

  if (config.shortcuts.rectTool && config.tools.rect && key === 'r') {
    return 'rect'
  }

  if (config.shortcuts.textTool && config.tools.text && key === 't') {
    return 'text'
  }

  const customTool = customCreationTools.find(
    (tool) =>
      tool.shortcut &&
      matchesCanvasAppCustomToolShortcut({
        event,
        shortcut: tool.shortcut,
      }),
  )

  return customTool?.id ?? null
}

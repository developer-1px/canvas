import type { CanvasAffordanceConfig } from '../../engine'
import type { Tool } from '../../entities'
import { getCanvasKeyboardBuiltinToolShortcut } from './CanvasKeyboardToolShortcuts'
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
  const builtInTool = getCanvasKeyboardBuiltinToolShortcut({
    config,
    event,
    key,
  })

  if (builtInTool) {
    return builtInTool
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

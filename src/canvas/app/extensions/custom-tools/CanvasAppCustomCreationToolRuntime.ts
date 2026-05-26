import type { CanvasCustomToolId } from '../../../entities'
import {
  formatCanvasAppCustomToolShortcut,
  getCanvasAppCustomToolId,
  getCanvasAppCustomToolRawId,
} from './CanvasAppCustomCreationToolContracts'
import type {
  CanvasAppCustomCreationTool,
} from './CanvasAppCustomCreationTools'
import type {
  CanvasAppCustomCreationToolState,
} from '../CanvasAppExtensionStateContracts'

export function getCanvasAppCustomCreationToolStates(
  tools: readonly CanvasAppCustomCreationTool[],
): CanvasAppCustomCreationToolState[] {
  return tools.map((tool) => ({
    ariaLabel: tool.ariaLabel ?? `${tool.title} tool`,
    id: getCanvasAppCustomToolId(tool.id),
    label: tool.label,
    shortcut: tool.shortcut,
    statusLabel: tool.statusLabel ?? tool.title,
    title: tool.shortcut
      ? `${tool.title} (${formatCanvasAppCustomToolShortcut(tool.shortcut)})`
      : tool.title,
  }))
}

export function getCanvasAppCustomCreationTool(
  tools: readonly CanvasAppCustomCreationTool[],
  toolId: CanvasCustomToolId,
) {
  const rawId = getCanvasAppCustomToolRawId(toolId)

  return tools.find((tool) => tool.id === rawId) ?? null
}

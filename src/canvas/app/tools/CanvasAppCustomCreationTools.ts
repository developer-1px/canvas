import type {
  CanvasCustomToolId,
  CanvasItem,
  Point,
} from '../../entities'

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
  createItem: (context: CanvasAppCustomCreationToolContext) => CanvasItem | null
  id: string
  label: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
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

export function getCanvasAppCustomToolId(id: string): CanvasCustomToolId {
  return `custom:${id}`
}

export function getCanvasAppCustomToolRawId(toolId: CanvasCustomToolId) {
  return toolId.slice('custom:'.length)
}

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

export function matchesCanvasAppCustomToolShortcut({
  event,
  shortcut,
}: {
  event: KeyboardEvent
  shortcut: CanvasAppCustomToolShortcut
}) {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    event.shiftKey === (shortcut.shiftKey ?? false)
  )
}

function formatCanvasAppCustomToolShortcut(
  shortcut: CanvasAppCustomToolShortcut,
) {
  return shortcut.shiftKey
    ? `Shift+${shortcut.key.toUpperCase()}`
    : shortcut.key.toUpperCase()
}

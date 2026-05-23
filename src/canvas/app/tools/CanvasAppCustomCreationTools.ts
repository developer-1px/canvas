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

const RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS = [
  { label: 'select tool', shortcut: { key: 'v' } },
  { label: 'pan tool', shortcut: { key: 'h' } },
  { label: 'rectangle tool', shortcut: { key: 'r' } },
  { label: 'text tool', shortcut: { key: 't' } },
  { label: 'marker tool', shortcut: { key: 'm' } },
  { label: 'highlighter tool', shortcut: { key: 'm', shiftKey: true } },
  { label: 'arrow tool', shortcut: { key: 'l' } },
  { label: 'fit all', shortcut: { key: '0' } },
  { label: 'fit selection', shortcut: { key: '1' } },
  { label: 'escape', shortcut: { key: 'Escape' } },
  { label: 'delete', shortcut: { key: 'Delete' } },
  { label: 'delete', shortcut: { key: 'Backspace' } },
  { label: 'nudge left', shortcut: { key: 'ArrowLeft' } },
  { label: 'nudge right', shortcut: { key: 'ArrowRight' } },
  { label: 'nudge up', shortcut: { key: 'ArrowUp' } },
  { label: 'nudge down', shortcut: { key: 'ArrowDown' } },
] satisfies readonly {
  label: string
  shortcut: CanvasAppCustomToolShortcut
}[]

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

export function assertCanvasAppCustomCreationToolShortcuts(
  tools: readonly CanvasAppCustomCreationTool[],
) {
  const reserved = new Map(
    RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS.map((entry) => [
      getCanvasAppCustomToolShortcutKey(entry.shortcut),
      entry.label,
    ]),
  )
  const seen = new Map<string, string>()

  for (const tool of tools) {
    if (!tool.shortcut) {
      continue
    }

    const key = getCanvasAppCustomToolShortcutKey(tool.shortcut)
    const label = formatCanvasAppCustomToolShortcut(tool.shortcut)
    const reservedLabel = reserved.get(key)
    const existingTool = seen.get(key)

    if (reservedLabel) {
      throw new Error(
        `Canvas app custom creation tool shortcut conflicts with ${reservedLabel}: ${tool.id} uses ${label}`,
      )
    }

    if (existingTool) {
      throw new Error(
        `Duplicate canvas app custom creation tool shortcut: ${existingTool} and ${tool.id} use ${label}`,
      )
    }

    seen.set(key, tool.id)
  }
}

export function getCanvasAppCustomToolShortcutKey(
  shortcut: CanvasAppCustomToolShortcut,
) {
  return `${shortcut.shiftKey === true ? 'shift+' : ''}${shortcut.key.toLowerCase()}`
}

export function formatCanvasAppCustomToolShortcut(
  shortcut: CanvasAppCustomToolShortcut,
) {
  return shortcut.shiftKey
    ? `Shift+${shortcut.key.toUpperCase()}`
    : shortcut.key.toUpperCase()
}

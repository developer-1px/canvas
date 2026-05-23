import type {
  CanvasCustomItem,
  CanvasCustomToolId,
  Point,
} from '../../entities'
import {
  assertCanvasAppExtensionEntries,
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'

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
  createItem: (
    context: CanvasAppCustomCreationToolContext,
  ) => CanvasCustomItem | null
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

type ReservedCanvasAppCustomToolShortcut = {
  label: string
  shortcut: CanvasAppCustomToolShortcut
}

type CanvasAppCustomToolShortcutReservationOptions = {
  shiftInsensitive?: boolean
}

const RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS = [
  ...reserveCanvasAppCustomToolShortcut('select tool', { key: 'v' }, {
    shiftInsensitive: true,
  }),
  ...reserveCanvasAppCustomToolShortcut('pan tool', { key: 'h' }, {
    shiftInsensitive: true,
  }),
  ...reserveCanvasAppCustomToolShortcut('rectangle tool', { key: 'r' }, {
    shiftInsensitive: true,
  }),
  ...reserveCanvasAppCustomToolShortcut('text tool', { key: 't' }, {
    shiftInsensitive: true,
  }),
  { label: 'marker tool', shortcut: { key: 'm' } },
  { label: 'highlighter tool', shortcut: { key: 'm', shiftKey: true } },
  ...reserveCanvasAppCustomToolShortcut('arrow tool', { key: 'l' }, {
    shiftInsensitive: true,
  }),
  ...reserveCanvasAppCustomToolShortcut('temporary pan', { key: 'Space' }, {
    shiftInsensitive: true,
  }),
  { label: 'fit all', shortcut: { key: '0' } },
  { label: 'fit selection', shortcut: { key: '1' } },
  ...reserveCanvasAppCustomToolShortcut('escape', { key: 'Escape' }, {
    shiftInsensitive: true,
  }),
  ...reserveCanvasAppCustomToolShortcut('delete', { key: 'Delete' }, {
    shiftInsensitive: true,
  }),
  ...reserveCanvasAppCustomToolShortcut('delete', { key: 'Backspace' }, {
    shiftInsensitive: true,
  }),
  { label: 'nudge left', shortcut: { key: 'ArrowLeft' } },
  { label: 'nudge right', shortcut: { key: 'ArrowRight' } },
  { label: 'nudge up', shortcut: { key: 'ArrowUp' } },
  { label: 'nudge down', shortcut: { key: 'ArrowDown' } },
  { label: 'large nudge left', shortcut: { key: 'ArrowLeft', shiftKey: true } },
  { label: 'large nudge right', shortcut: { key: 'ArrowRight', shiftKey: true } },
  { label: 'large nudge up', shortcut: { key: 'ArrowUp', shiftKey: true } },
  { label: 'large nudge down', shortcut: { key: 'ArrowDown', shiftKey: true } },
] satisfies readonly ReservedCanvasAppCustomToolShortcut[]

export function getCanvasAppCustomToolId(id: string): CanvasCustomToolId {
  assertCanvasAppExtensionId({
    id,
    label: 'custom creation tool',
  })

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
    normalizeCanvasAppCustomToolShortcutKey(event.key).toLowerCase() ===
      normalizeCanvasAppCustomToolShortcutKey(shortcut.key).toLowerCase() &&
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

export function assertCanvasAppCustomCreationTools(
  tools: readonly CanvasAppCustomCreationTool[],
) {
  assertCanvasAppExtensionEntries({
    entries: tools,
    label: 'custom creation tool',
  })

  for (const tool of tools) {
    if (typeof tool.createItem !== 'function') {
      throw new Error(
        `Canvas app custom creation tool ${tool.id} requires createItem`,
      )
    }
  }

  assertCanvasAppCustomCreationToolShortcuts(tools)
}

export function getCanvasAppCustomToolShortcutKey(
  shortcut: CanvasAppCustomToolShortcut,
) {
  const key = normalizeCanvasAppCustomToolShortcutKey(
    shortcut.key,
  ).toLowerCase()

  return `${shortcut.shiftKey === true ? 'shift+' : ''}${key}`
}

export function formatCanvasAppCustomToolShortcut(
  shortcut: CanvasAppCustomToolShortcut,
) {
  const key = formatCanvasAppCustomToolShortcutKey(shortcut.key)

  return shortcut.shiftKey ? `Shift+${key}` : key
}

function reserveCanvasAppCustomToolShortcut(
  label: string,
  shortcut: CanvasAppCustomToolShortcut,
  options: CanvasAppCustomToolShortcutReservationOptions = {},
): ReservedCanvasAppCustomToolShortcut[] {
  if (!options.shiftInsensitive) {
    return [{ label, shortcut }]
  }

  return [
    { label, shortcut },
    { label, shortcut: { ...shortcut, shiftKey: true } },
  ]
}

function normalizeCanvasAppCustomToolShortcutKey(key: string) {
  return key === ' ' ? 'Space' : key
}

function formatCanvasAppCustomToolShortcutKey(key: string) {
  const normalizedKey = normalizeCanvasAppCustomToolShortcutKey(key)

  if (normalizedKey === 'Space') {
    return 'Space'
  }

  if (normalizedKey.startsWith('Arrow')) {
    return normalizedKey
  }

  return normalizedKey.length === 1
    ? normalizedKey.toUpperCase()
    : normalizedKey
}

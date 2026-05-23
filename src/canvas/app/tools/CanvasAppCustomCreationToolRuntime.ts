import type { CanvasCustomToolId } from '../../entities'
import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import {
  formatCanvasKeyboardShortcutChord,
  getCanvasKeyboardShortcutChordKey,
  matchesCanvasKeyboardShortcutChord,
} from '../keyboard/CanvasKeyboardShortcutChords'
import type {
  CanvasAppCustomCreationTool,
  CanvasAppCustomToolShortcut,
} from './CanvasAppCustomCreationTools'

export type CanvasAppCustomCreationToolState = {
  ariaLabel: string
  id: CanvasCustomToolId
  label: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel: string
  title: string
}

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
  return matchesCanvasKeyboardShortcutChord({ event, shortcut })
}

export function getCanvasAppCustomToolShortcutKey(
  shortcut: CanvasAppCustomToolShortcut,
) {
  return getCanvasKeyboardShortcutChordKey(shortcut)
}

export function formatCanvasAppCustomToolShortcut(
  shortcut: CanvasAppCustomToolShortcut,
) {
  return formatCanvasKeyboardShortcutChord(shortcut)
}

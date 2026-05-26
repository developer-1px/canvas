import type { CanvasCustomToolId } from '../../../entities'
import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
  assertCanvasAppOptionalDescriptorBooleanField,
  assertCanvasAppOptionalDescriptorStringField,
} from '../CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionEntries,
  assertCanvasAppExtensionId,
} from '../CanvasAppExtensionIds'
import {
  getCanvasKeyboardReservedShortcuts,
} from '../../interaction/keyboard/CanvasKeyboardReservedShortcuts'
import {
  formatCanvasKeyboardShortcutChord,
  getCanvasKeyboardShortcutChordKey,
  matchesCanvasKeyboardShortcutChord,
} from '../../interaction/keyboard/CanvasKeyboardShortcutChords'
import type {
  CanvasAppCustomCreationTool,
  CanvasAppCustomToolShortcut,
} from './CanvasAppCustomCreationTools'

type CanvasAppCustomCreationToolDescriptor = Omit<
  CanvasAppCustomCreationTool,
  'createItem'
> & {
  createItem: unknown
}

type CanvasAppCustomCreationToolShortcutDescriptor = Pick<
  CanvasAppCustomCreationToolDescriptor,
  'id' | 'shortcut'
>

type ReservedCanvasAppCustomToolShortcut = {
  label: string
  shortcut: CanvasAppCustomToolShortcut
}

const RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS:
  readonly ReservedCanvasAppCustomToolShortcut[] =
    getCanvasKeyboardReservedShortcuts()

export function assertCanvasAppCustomCreationTools(
  tools: readonly CanvasAppCustomCreationToolDescriptor[],
) {
  assertCanvasAppExtensionEntries({
    entries: tools,
    label: 'custom creation tool',
  })

  for (const tool of tools) {
    assertCanvasAppCustomCreationToolDescriptor(tool)
  }

  assertCanvasAppCustomCreationToolShortcuts(tools)
}

export function assertCanvasAppCustomCreationToolShortcuts(
  tools: readonly CanvasAppCustomCreationToolShortcutDescriptor[],
) {
  const reserved = new Map(
    RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS.map((entry) => [
      getCanvasKeyboardShortcutChordKey(entry.shortcut),
      entry.label,
    ]),
  )
  const seen = new Map<string, string>()

  for (const tool of tools) {
    if (!tool.shortcut) {
      continue
    }

    const key = getCanvasKeyboardShortcutChordKey(tool.shortcut)
    const label = formatCanvasKeyboardShortcutChord(tool.shortcut)
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

function assertCanvasAppCustomCreationToolDescriptor(
  tool: CanvasAppCustomCreationToolDescriptor,
) {
  const owner = `custom creation tool ${tool.id}`

  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner,
    value: tool.label,
  })
  assertCanvasAppDescriptorStringField({
    field: 'title',
    owner,
    value: tool.title,
  })
  assertCanvasAppOptionalDescriptorStringField({
    field: 'ariaLabel',
    owner,
    value: tool.ariaLabel,
  })
  assertCanvasAppOptionalDescriptorStringField({
    field: 'statusLabel',
    owner,
    value: tool.statusLabel,
  })
  assertCanvasAppDescriptorFunctionField({
    field: 'createItem',
    owner,
    value: tool.createItem,
  })

  if (tool.shortcut !== undefined) {
    assertCanvasAppCustomToolShortcutDescriptor({
      owner,
      shortcut: tool.shortcut,
    })
  }
}

function assertCanvasAppCustomToolShortcutDescriptor({
  owner,
  shortcut,
}: {
  owner: string
  shortcut: CanvasAppCustomToolShortcut
}) {
  assertCanvasAppDescriptorObject(shortcut, `${owner} shortcut`)
  assertCanvasAppDescriptorStringField({
    field: 'shortcut.key',
    owner,
    value: shortcut.key,
  })
  assertCanvasAppOptionalDescriptorBooleanField({
    field: 'shortcut.shiftKey',
    owner,
    value: shortcut.shiftKey,
  })
}

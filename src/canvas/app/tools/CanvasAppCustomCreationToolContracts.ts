import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
  assertCanvasAppOptionalDescriptorBooleanField,
  assertCanvasAppOptionalDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionEntries } from '../extensions/CanvasAppExtensionIds'
import {
  formatCanvasAppCustomToolShortcut,
  getCanvasAppCustomToolShortcutKey,
} from './CanvasAppCustomCreationToolRuntime'
import type {
  CanvasAppCustomCreationTool,
  CanvasAppCustomToolShortcut,
} from './CanvasAppCustomCreationTools'

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

export function assertCanvasAppCustomCreationTools(
  tools: readonly CanvasAppCustomCreationTool[],
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

function assertCanvasAppCustomCreationToolDescriptor(
  tool: CanvasAppCustomCreationTool,
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

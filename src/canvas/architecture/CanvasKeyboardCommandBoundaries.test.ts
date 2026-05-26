import { describe, expect, it } from 'vitest'

import { getCanvasKeyboardArchitectureFiles } from './CanvasKeyboardArchitectureFiles'

describe('Canvas keyboard command boundaries', () => {
  it('keeps command shortcuts and nudge shortcuts in their named modules', () => {
    const { commandIntentFile, commandShortcutFile, commandShortcutCatalogFile, commandDispatchFile, nudgeShortcutFile, nudgeShortcutCatalogFile } =
      getCanvasKeyboardArchitectureFiles()

    expect(commandIntentFile.source).toContain(
      'export function getCanvasKeyboardCommandShortcutIntent',
    )
    expect(commandIntentFile.source).toContain(
      "from './CanvasKeyboardCommandShortcuts'",
    )
    expect(commandIntentFile.source).toContain(
      "from './CanvasKeyboardViewportShortcuts'",
    )
    expect(commandIntentFile.source).toContain(
      "from './CanvasKeyboardNudgeShortcuts'",
    )
    expect(commandIntentFile.source).not.toContain(
      "event.key.startsWith('Arrow')",
    )
    expect(commandIntentFile.source).not.toContain("key === 'z'")
    expect(commandShortcutFile.source).toContain(
      'export function getCanvasKeyboardBuiltinCommandShortcutIntent',
    )
    expect(commandShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedCommandShortcuts',
    )
    expect(commandShortcutFile.source).toContain(
      "from './CanvasKeyboardCommandShortcutCatalog'",
    )
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'undo'")
    expect(commandShortcutFile.source).not.toContain(
      "kind: 'reorder-selection'",
    )
    expect(commandShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_COMMAND_SHORTCUTS',
    )
    expect(commandShortcutCatalogFile.source).toContain("shortcutId: 'undo'")
    expect(commandShortcutCatalogFile.source).toContain(
      "kind: 'reorder-selection'",
    )
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'fitAll'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'zoomIn'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'nudge'")
    expect(commandShortcutFile.source).not.toContain("'large nudge left'")
    expect(commandShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'fitAll'",
    )
    expect(commandShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'zoomIn'",
    )
    expect(commandShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'nudge'",
    )
    expect(commandShortcutCatalogFile.source).not.toContain(
      "'large nudge left'",
    )
    expect(commandDispatchFile.source).toContain(
      'export function runCanvasKeyboardCommandIntent',
    )
    expect(commandDispatchFile.source).toContain(
      'export function isCanvasKeyboardCommandIntent',
    )
    expect(commandDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(commandDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH',
    )
    expect(commandDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH.run',
    )
    expect(commandDispatchFile.source).toContain(
      'handlers.moveSelection(intent.dx, intent.dy)',
    )
    expect(commandDispatchFile.source).not.toContain(
      'CANVAS_KEYBOARD_COMMAND_INTENT_KINDS',
    )
    expect(commandDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(commandDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardCommandIntentRunners',
    )
    expect(commandDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardCommandIntentRunner',
    )
    expect(commandDispatchFile.source).not.toContain(
      'function getCanvasKeyboardCommandIntentRunner',
    )
    expect(nudgeShortcutFile.source).toContain(
      'export function getCanvasKeyboardNudgeShortcutIntent',
    )
    expect(nudgeShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedNudgeShortcuts',
    )
    expect(nudgeShortcutFile.source).toContain(
      "from './CanvasKeyboardNudgeShortcutCatalog'",
    )
    expect(nudgeShortcutFile.source).not.toContain("'large nudge left'")
    expect(nudgeShortcutFile.source).toContain("kind: 'nudge-selection'")
    expect(nudgeShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_NUDGE_SHORTCUTS',
    )
    expect(nudgeShortcutCatalogFile.source).toContain("'large nudge left'")
    expect(nudgeShortcutCatalogFile.source).not.toContain(
      "kind: 'nudge-selection'",
    )
  })
})

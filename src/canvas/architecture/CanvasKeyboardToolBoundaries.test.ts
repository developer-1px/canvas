import { describe, expect, it } from 'vitest'

import { getCanvasKeyboardArchitectureFiles } from './CanvasKeyboardArchitectureFiles'

describe('Canvas keyboard tool boundaries', () => {
  it('keeps tool dispatch behind its dispatch table', () => {
    const { toolDispatchFile } =
      getCanvasKeyboardArchitectureFiles()

    expect(toolDispatchFile.source).toContain(
      'export function runCanvasKeyboardToolIntent',
    )
    expect(toolDispatchFile.source).toContain(
      'export function isCanvasKeyboardToolIntent',
    )
    expect(toolDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(toolDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH',
    )
    expect(toolDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH.run',
    )
    expect(toolDispatchFile.source).toContain('handlers.setTool(intent.tool)')
    expect(toolDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(toolDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardToolIntentRunners',
    )
    expect(toolDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardToolIntentRunner',
    )
    expect(toolDispatchFile.source).not.toContain(
      'function getCanvasKeyboardToolIntentRunner',
    )
  })

  it('keeps tool shortcuts and reserved shortcut aggregation in named modules', () => {
    const { toolIntentFile, toolShortcutFile, toolShortcutCatalogFile, reservedShortcutFile } =
      getCanvasKeyboardArchitectureFiles()

    expect(toolIntentFile.source).toContain(
      'export function getCanvasKeyboardToolShortcutIntent',
    )
    expect(toolIntentFile.source).toContain(
      "from './CanvasKeyboardToolShortcuts'",
    )
    expect(toolIntentFile.source).toContain(
      'matchesCanvasAppCustomToolShortcut',
    )
    expect(toolIntentFile.source).not.toContain("key === 'v'")
    expect(toolIntentFile.source).not.toContain("key === 'm'")
    expect(toolShortcutFile.source).toContain(
      'export function getCanvasKeyboardBuiltinToolShortcut',
    )
    expect(toolShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedToolShortcuts',
    )
    expect(toolShortcutFile.source).toContain(
      "from './CanvasKeyboardToolShortcutCatalog'",
    )
    expect(toolShortcutFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES')
    expect(toolShortcutFile.source).not.toContain('CANVAS_TOOL_AFFORDANCE_ORDER')
    expect(toolShortcutFile.source).not.toContain("shortcutId: 'selectTool'")
    expect(toolShortcutFile.source).not.toContain("shortcutId: 'markerTool'")
    expect(toolShortcutFile.source).not.toContain("tool: 'select'")
    expect(toolShortcutFile.source).not.toContain("key: 'v'")
    expect(toolShortcutFile.source).not.toContain("key: 'm'")
    expect(toolShortcutCatalogFile.source).toContain(
      'CANVAS_TOOL_AFFORDANCES',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'CANVAS_TOOL_AFFORDANCE_ORDER',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'CANVAS_TOOL_AFFORDANCE_ORDER.flatMap',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'keyboardShortcut.shortcutId',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'affordance.ariaLabel.toLowerCase()',
    )
    expect(toolShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'selectTool'",
    )
    expect(toolShortcutCatalogFile.source).not.toContain("tool: 'select'")
    expect(toolShortcutCatalogFile.source).not.toContain("key: 'v'")
    expect(toolShortcutCatalogFile.source).not.toContain(
      "kind: 'set-tool'",
    )
    expect(reservedShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedToolShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedCommandShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedViewportShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedNudgeShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedSystemShortcuts',
    )
    expect(reservedShortcutFile.source).not.toContain("'fit all'")
    expect(reservedShortcutFile.source).not.toContain("'temporary pan'")
    expect(reservedShortcutFile.source).not.toContain("'large nudge left'")
  })
})

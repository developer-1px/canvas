import { describe, expect, it } from 'vitest'

import { getCanvasKeyboardArchitectureFiles } from './CanvasKeyboardArchitectureFiles'

describe('Canvas keyboard viewport and system boundaries', () => {
  it('keeps viewport and system shortcuts in their named modules', () => {
    const { viewportShortcutFile, viewportShortcutCatalogFile, systemShortcutFile, systemShortcutCatalogFile } =
      getCanvasKeyboardArchitectureFiles()

    expect(viewportShortcutFile.source).toContain(
      'export function getCanvasKeyboardViewportShortcutIntent',
    )
    expect(viewportShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedViewportShortcuts',
    )
    expect(viewportShortcutFile.source).toContain(
      "from './CanvasKeyboardViewportShortcutCatalog'",
    )
    expect(viewportShortcutFile.source).not.toContain("shortcutId: 'fitAll'")
    expect(viewportShortcutFile.source).not.toContain("shortcutId: 'zoomIn'")
    expect(viewportShortcutFile.source).not.toContain("kind: 'fit-selection'")
    expect(viewportShortcutFile.source).not.toContain("kind: 'zoom-by'")
    expect(viewportShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS',
    )
    expect(viewportShortcutCatalogFile.source).toContain(
      "shortcutId: 'fitAll'",
    )
    expect(viewportShortcutCatalogFile.source).toContain(
      "shortcutId: 'zoomIn'",
    )
    expect(viewportShortcutCatalogFile.source).toContain(
      "kind: 'fit-selection'",
    )
    expect(viewportShortcutCatalogFile.source).toContain("kind: 'zoom-by'")
    expect(viewportShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'nudge'",
    )
    expect(viewportShortcutCatalogFile.source).not.toContain(
      "'large nudge left'",
    )
    expect(systemShortcutFile.source).toContain(
      'export function getCanvasKeyboardSystemShortcutIntent',
    )
    expect(systemShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedSystemShortcuts',
    )
    expect(systemShortcutFile.source).toContain(
      "from './CanvasKeyboardSystemShortcutCatalog'",
    )
    expect(systemShortcutFile.source).not.toContain("shortcutId: 'findReplace'")
    expect(systemShortcutFile.source).not.toContain(
      "shortcutId: 'temporaryPan'",
    )
    expect(systemShortcutFile.source).not.toContain("shortcutId: 'escape'")
    expect(systemShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_SYSTEM_SHORTCUTS',
    )
    expect(systemShortcutCatalogFile.source).toContain(
      "shortcutId: 'findReplace'",
    )
    expect(systemShortcutCatalogFile.source).toContain(
      "shortcutId: 'temporaryPan'",
    )
    expect(systemShortcutCatalogFile.source).toContain("shortcutId: 'escape'")
    expect(systemShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'fitAll'",
    )
    expect(systemShortcutCatalogFile.source).not.toContain(
      "'large nudge left'",
    )
  })

  it('keeps viewport and system dispatch behind dispatch tables', () => {
    const { systemDispatchFile, viewportDispatchFile } =
      getCanvasKeyboardArchitectureFiles()

    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemIntent',
    )
    expect(systemDispatchFile.source).toContain(
      'export function isCanvasKeyboardSystemIntent',
    )
    expect(systemDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(systemDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH',
    )
    expect(systemDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH.run',
    )
    expect(systemDispatchFile.source).toContain('commitSelection([])')
    expect(systemDispatchFile.source).not.toContain(
      'CANVAS_KEYBOARD_SYSTEM_INTENT_KINDS',
    )
    expect(systemDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(systemDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardSystemIntentRunners',
    )
    expect(systemDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardSystemIntentRunner',
    )
    expect(systemDispatchFile.source).not.toContain(
      'function getCanvasKeyboardSystemIntentRunner',
    )
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemKeyUp',
    )
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemWindowBlur',
    )
    expect(systemDispatchFile.source).toContain(
      'export type CanvasKeyboardSystemReleaseHandlers',
    )
    expect(systemDispatchFile.source).toContain(
      'shouldReleaseCanvasKeyboardTemporaryPan',
    )
    expect(systemDispatchFile.source).toContain('setSpaceDown(false)')
    expect(systemDispatchFile.source).not.toContain('Pick<')
    expect(viewportDispatchFile.source).toContain(
      'export function runCanvasKeyboardViewportIntent',
    )
    expect(viewportDispatchFile.source).toContain(
      'export function isCanvasKeyboardViewportIntent',
    )
    expect(viewportDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(viewportDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH',
    )
    expect(viewportDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH.run',
    )
    expect(viewportDispatchFile.source).toContain('fitToItems(intent.ids)')
    expect(viewportDispatchFile.source).not.toContain(
      'CANVAS_KEYBOARD_VIEWPORT_INTENT_KINDS',
    )
    expect(viewportDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(viewportDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardViewportIntentRunners',
    )
    expect(viewportDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardViewportIntentRunner',
    )
    expect(viewportDispatchFile.source).not.toContain(
      'function getCanvasKeyboardViewportIntentRunner',
    )
  })
})

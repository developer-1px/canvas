import { describe, expect, it } from 'vitest'

import { getCanvasKeyboardArchitectureFiles } from './CanvasKeyboardArchitectureFiles'

describe('Canvas keyboard routing boundaries', () => {
  it('keeps shortcut routing behind intent and dispatch modules', () => {
    const { routerFile, hookFile, listenerFile, intentFile, intentContractsFile } =
      getCanvasKeyboardArchitectureFiles()

    expect(routerFile.source).toContain(
      "from './CanvasKeyboardShortcutIntent'",
    )
    expect(routerFile.source).toContain(
      "from './CanvasKeyboardShortcutDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardCommandDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardViewportDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardToolDispatch'",
    )
    expect(routerFile.source).toContain('runCanvasKeyboardShortcutIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardCommandIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardSystemIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardViewportIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardToolIntent')
    expect(routerFile.source).not.toContain("intent.kind === 'none'")
    expect(routerFile.source).not.toContain('config.shortcuts.temporaryPan')
    expect(routerFile.source).not.toContain(
      'matchesCanvasAppCustomToolShortcut',
    )
    expect(routerFile.source).not.toContain('handlers.deleteSelection()')
    expect(routerFile.source).not.toContain('handlers.moveSelection(')
    expect(routerFile.source).not.toContain(
      'handlers.reorderSelection(',
    )
    expect(routerFile.source).not.toContain('handlers.openFindReplace()')
    expect(routerFile.source).not.toContain('handlers.setSpaceDown(true)')
    expect(routerFile.source).not.toContain('handlers.commitSelection([])')
    expect(routerFile.source).not.toContain('handlers.zoomBy(')
    expect(routerFile.source).not.toContain('handlers.resetViewport()')
    expect(routerFile.source).not.toContain('handlers.fitToItems(')
    expect(routerFile.source).not.toContain('handlers.setTool(')
    expect(routerFile.source).not.toContain('switch (intent.kind)')
    expect(routerFile.source).not.toContain("event.key.startsWith('Arrow')")
    expect(routerFile.source).not.toContain("key === 'z'")
    expect(hookFile.source).toContain(
      "from './CanvasKeyboardShortcutListeners'",
    )
    expect(hookFile.source).not.toContain(
      "from './CanvasKeyboardSystemShortcuts'",
    )
    expect(hookFile.source).not.toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(hookFile.source).not.toContain(
      'shouldReleaseCanvasKeyboardTemporaryPan',
    )
    expect(hookFile.source).not.toContain('setSpaceDown(false)')
    expect(hookFile.source).not.toContain('addEventListener')
    expect(hookFile.source).not.toContain('removeEventListener')
    expect(hookFile.source).not.toContain('handleCanvasKeyboardShortcut(')
    expect(hookFile.source).not.toContain(
      'runCanvasKeyboardSystemKeyUp',
    )
    expect(hookFile.source).not.toContain(
      'runCanvasKeyboardSystemWindowBlur',
    )
    expect(listenerFile.source).toContain(
      'export function bindCanvasKeyboardShortcutListeners',
    )
    expect(listenerFile.source).toContain('handleCanvasKeyboardShortcut(')
    expect(listenerFile.source).toContain('runCanvasKeyboardSystemKeyUp')
    expect(listenerFile.source).toContain(
      'runCanvasKeyboardSystemWindowBlur',
    )
    expect(listenerFile.source).toContain("addEventListener('keydown'")
    expect(listenerFile.source).toContain("removeEventListener('keydown'")
    expect(intentFile.source).toContain(
      'export function getCanvasKeyboardShortcutIntent',
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardShortcutIntentContracts'",
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardToolShortcutIntent'",
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardCommandShortcutIntent'",
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardSystemShortcuts'",
    )
    expect(intentFile.source).not.toContain('config.shortcuts.temporaryPan')
    expect(intentFile.source).not.toContain("key === 'f'")
    expect(intentFile.source).not.toContain("event.code === 'Space'")
    expect(intentFile.source).not.toContain("event.key === 'Escape'")
    expect(intentFile.source).not.toContain(
      'matchesCanvasAppCustomToolShortcut',
    )
    expect(intentFile.source).not.toContain(
      'export type CanvasKeyboardShortcutIntent =',
    )
    expect(intentFile.source).not.toContain(
      'export type { CanvasKeyboardReorderMode }',
    )
    expect(intentFile.source).not.toContain("event.key.startsWith('Arrow')")
    expect(intentFile.source).not.toContain("key === 'z'")
    expect(intentContractsFile.source).toContain(
      'export type CanvasKeyboardShortcutIntent =',
    )
    expect(intentContractsFile.source).toContain(
      'export type { CanvasKeyboardReorderMode }',
    )
  })
})

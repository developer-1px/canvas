import { getSourceFile } from './CanvasArchitectureTestSources'

export function getCanvasKeyboardArchitectureFiles() {
  return {
    routerFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutRouter.ts',
    ),
    hookFile: getSourceFile(
      'src/canvas/app/keyboard/useCanvasKeyboardShortcuts.ts',
    ),
    listenerFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutListeners.ts',
    ),
    intentFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutIntent.ts',
    ),
    intentContractsFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutIntentContracts.ts',
    ),
    commandIntentFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandShortcutIntent.ts',
    ),
    commandShortcutFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandShortcuts.ts',
    ),
    commandShortcutCatalogFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandShortcutCatalog.ts',
    ),
    commandDispatchFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandDispatch.ts',
    ),
    shortcutDispatchFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutDispatch.ts',
    ),
    intentDispatchTableFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardIntentDispatchTable.ts',
    ),
    nudgeShortcutFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardNudgeShortcuts.ts',
    ),
    nudgeShortcutCatalogFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardNudgeShortcutCatalog.ts',
    ),
    viewportShortcutFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportShortcuts.ts',
    ),
    viewportShortcutCatalogFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportShortcutCatalog.ts',
    ),
    systemShortcutFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemShortcuts.ts',
    ),
    systemShortcutCatalogFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemShortcutCatalog.ts',
    ),
    systemDispatchFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemDispatch.ts',
    ),
    viewportDispatchFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportDispatch.ts',
    ),
    toolDispatchFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolDispatch.ts',
    ),
    toolIntentFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    ),
    toolShortcutFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcuts.ts',
    ),
    toolShortcutCatalogFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcutCatalog.ts',
    ),
    reservedShortcutFile: getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardReservedShortcuts.ts',
    ),
  }
}

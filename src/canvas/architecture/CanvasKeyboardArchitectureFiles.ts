import { getSourceFile } from './CanvasArchitectureTestSources'

export function getCanvasKeyboardArchitectureFiles() {
  return {
    routerFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardShortcutRouter.ts',
    ),
    hookFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/useCanvasKeyboardShortcuts.ts',
    ),
    listenerFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardShortcutListeners.ts',
    ),
    intentFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardShortcutIntent.ts',
    ),
    intentContractsFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardShortcutIntentContracts.ts',
    ),
    commandIntentFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardCommandShortcutIntent.ts',
    ),
    commandShortcutFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardCommandShortcuts.ts',
    ),
    commandShortcutCatalogFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardCommandShortcutCatalog.ts',
    ),
    commandDispatchFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardCommandDispatch.ts',
    ),
    shortcutDispatchFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardShortcutDispatch.ts',
    ),
    intentDispatchTableFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardIntentDispatchTable.ts',
    ),
    nudgeShortcutFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardNudgeShortcuts.ts',
    ),
    nudgeShortcutCatalogFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardNudgeShortcutCatalog.ts',
    ),
    viewportShortcutFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardViewportShortcuts.ts',
    ),
    viewportShortcutCatalogFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardViewportShortcutCatalog.ts',
    ),
    systemShortcutFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardSystemShortcuts.ts',
    ),
    systemShortcutCatalogFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardSystemShortcutCatalog.ts',
    ),
    systemDispatchFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardSystemDispatch.ts',
    ),
    viewportDispatchFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardViewportDispatch.ts',
    ),
    toolDispatchFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardToolDispatch.ts',
    ),
    toolIntentFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    ),
    toolShortcutFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardToolShortcuts.ts',
    ),
    toolShortcutCatalogFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardToolShortcutCatalog.ts',
    ),
    reservedShortcutFile: getSourceFile(
      'src/canvas/app/interaction/keyboard/CanvasKeyboardReservedShortcuts.ts',
    ),
  }
}

import { getSourceFile } from './CanvasArchitectureTestSources'

export function getCanvasKeyboardArchitectureFiles() {
  return {
    routerFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutRouter.ts',
    ),
    hookFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/useCanvasKeyboardShortcuts.ts',
    ),
    listenerFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutListeners.ts',
    ),
    intentFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutIntent.ts',
    ),
    intentContractsFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutIntentContracts.ts',
    ),
    commandIntentFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandShortcutIntent.ts',
    ),
    commandShortcutFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandShortcuts.ts',
    ),
    commandShortcutCatalogFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandShortcutCatalog.ts',
    ),
    commandDispatchFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardCommandDispatch.ts',
    ),
    shortcutDispatchFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutDispatch.ts',
    ),
    intentDispatchTableFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardIntentDispatchTable.ts',
    ),
    nudgeShortcutFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardNudgeShortcuts.ts',
    ),
    nudgeShortcutCatalogFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardNudgeShortcutCatalog.ts',
    ),
    viewportShortcutFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardViewportShortcuts.ts',
    ),
    viewportShortcutCatalogFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardViewportShortcutCatalog.ts',
    ),
    systemShortcutFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardSystemShortcuts.ts',
    ),
    systemShortcutCatalogFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardSystemShortcutCatalog.ts',
    ),
    systemDispatchFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardSystemDispatch.ts',
    ),
    viewportDispatchFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardViewportDispatch.ts',
    ),
    toolDispatchFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardToolDispatch.ts',
    ),
    toolIntentFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    ),
    toolShortcutFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardToolShortcuts.ts',
    ),
    toolShortcutCatalogFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardToolShortcutCatalog.ts',
    ),
    reservedShortcutFile: getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardReservedShortcuts.ts',
    ),
  }
}

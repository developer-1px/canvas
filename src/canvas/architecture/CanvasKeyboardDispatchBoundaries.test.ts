import { describe, expect, it } from 'vitest'

import { getCanvasKeyboardArchitectureFiles } from './CanvasKeyboardArchitectureFiles'

describe('Canvas keyboard dispatch boundaries', () => {
  it('keeps shortcut dispatch and intent dispatch table separated', () => {
    const { commandDispatchFile, shortcutDispatchFile, systemDispatchFile, viewportDispatchFile, toolDispatchFile, intentDispatchTableFile } =
      getCanvasKeyboardArchitectureFiles()

    for (const dispatchFile of [
      commandDispatchFile,
      shortcutDispatchFile,
      systemDispatchFile,
      viewportDispatchFile,
      toolDispatchFile,
    ]) {
      expect(dispatchFile.source).toContain(
        "from './CanvasKeyboardShortcutIntentContracts'",
      )
      expect(dispatchFile.source).not.toContain(
        "from './CanvasKeyboardShortcutIntent'",
      )
    }
    expect(shortcutDispatchFile.source).toContain(
      'export function runCanvasKeyboardShortcutIntent',
    )
    expect(shortcutDispatchFile.source).toContain(
      'export type CanvasKeyboardShortcutDispatchHandlers',
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardCommandDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardViewportDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardToolDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      'isCanvasKeyboardCommandIntent(intent)',
    )
    expect(shortcutDispatchFile.source).toContain("intent.kind === 'none'")
    expect(shortcutDispatchFile.source).not.toContain('event.preventDefault')
    expect(shortcutDispatchFile.source).not.toContain(
      'getCanvasKeyboardShortcutIntent',
    )
    expect(intentDispatchTableFile.source).toContain(
      'export function createCanvasKeyboardIntentDispatchTable',
    )
    expect(intentDispatchTableFile.source).toContain('hasKind(kind: string)')
    expect(intentDispatchTableFile.source).toContain('run({')
  })
})

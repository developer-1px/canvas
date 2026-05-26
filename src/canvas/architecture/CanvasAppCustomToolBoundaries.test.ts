import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App custom tool boundaries', () => {
  it('keeps App custom creation tool runtime behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/extensions/custom-tools/CanvasAppCustomCreationTools.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/extensions/custom-tools/CanvasAppCustomCreationToolContracts.ts',
    )
    const runtimeFile = getSourceFile(
      'src/canvas/app/extensions/custom-tools/CanvasAppCustomCreationToolRuntime.ts',
    )
    const extensionStateContractsFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionStateContracts.ts',
    )
    const extensionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppExtensionModel.ts',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const keyboardRouterFile = getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutRouter.ts',
    )
    const keyboardIntentFile = getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardShortcutIntent.ts',
    )
    const keyboardToolIntentFile = getSourceFile(
      'src/canvas/app/affordances/interaction/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    )
    const pointerCustomCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCustomCreation.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCreationToolRuntime'",
    )
    expect(contractsFile.source).not.toContain(
      "from './CanvasAppCustomCreationToolRuntime'",
    )
    expect(contractsFile.source).toContain(
      "from '../../affordances/interaction/keyboard/CanvasKeyboardShortcutChords'",
    )
    expect(descriptorFile.source).not.toContain(
      'export function getCanvasAppCustomCreationToolStates',
    )
    expect(descriptorFile.source).not.toContain(
      'export function getCanvasAppCustomCreationTool(',
    )
    expect(descriptorFile.source).not.toContain(
      'export function matchesCanvasAppCustomToolShortcut',
    )
    expect(runtimeFile.source).toContain(
      'export function getCanvasAppCustomCreationToolStates',
    )
    expect(runtimeFile.source).not.toContain(
      'export type CanvasAppCustomCreationToolState',
    )
    expect(runtimeFile.source).toContain(
      "from '../CanvasAppExtensionStateContracts'",
    )
    expect(extensionStateContractsFile.source).toContain(
      'export type CanvasAppCustomCreationToolState',
    )
    expect(runtimeFile.source).toContain(
      'export function getCanvasAppCustomCreationTool(',
    )
    expect(runtimeFile.source).not.toContain(
      'export function matchesCanvasAppCustomToolShortcut',
    )
    expect(runtimeFile.source).not.toContain(
      'export function getCanvasAppCustomToolId',
    )
    expect(contractsFile.source).toContain(
      'export function matchesCanvasAppCustomToolShortcut',
    )
    expect(contractsFile.source).toContain(
      'export function getCanvasAppCustomToolId',
    )
    expect(keyboardRouterFile.source).toContain(
      "from './CanvasKeyboardShortcutIntent'",
    )
    for (const file of [
      extensionModelFile,
      pointerCustomCreationFile,
    ]) {
      expect(file.source).toContain(
        'CanvasAppCustomCreationToolRuntime',
      )
    }
    expect(keyboardToolIntentFile.source).toContain(
      'CanvasAppCustomCreationToolContracts',
    )
    expect(keyboardToolIntentFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
    expect(keyboardRouterFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
    expect(keyboardIntentFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
    expect(appModelFile.source).toContain(
      "from './useCanvasAppExtensionModel'",
    )
    expect(appModelFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
  })


  it('keeps App custom creation tool contracts behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/extensions/custom-tools/CanvasAppCustomCreationTools.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/extensions/custom-tools/CanvasAppCustomCreationToolContracts.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCreationToolContracts'",
    )
    expect(descriptorFile.source).not.toContain(
      'function assertCanvasAppCustomCreationTools',
    )
    expect(descriptorFile.source).not.toContain(
      'RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS',
    )
    expect(descriptorFile.source).not.toContain(
      'shortcut conflicts with',
    )
    expect(descriptorFile.source).not.toContain(
      'Duplicate canvas app custom creation tool shortcut',
    )
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppCustomCreationTools',
    )
    expect(contractsFile.source).toContain(
      'export function getCanvasAppCustomToolId',
    )
    expect(contractsFile.source).toContain(
      'export function matchesCanvasAppCustomToolShortcut',
    )
    expect(contractsFile.source).toContain(
      'RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS',
    )
    expect(contractsFile.source).toContain(
      'getCanvasKeyboardReservedShortcuts',
    )
    expect(contractsFile.source).not.toContain("label: 'select tool'")
    expect(contractsFile.source).not.toContain("label: 'marker tool'")
    expect(contractsFile.source).not.toContain("'temporary pan'")
    expect(contractsFile.source).not.toContain("'large nudge left'")
    expect(contractsFile.source).toContain('shortcut conflicts with')
    expect(contractsFile.source).toContain(
      'Duplicate canvas app custom creation tool shortcut',
    )
  })

})

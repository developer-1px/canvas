import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App command effect boundaries', () => {
  it('keeps App standard command document effects behind a named module', () => {
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandExecution.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandDocumentEffects.ts',
    )
    const effectContractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandDocumentEffectContracts.ts',
    )

    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffects'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffectContracts'",
    )
    expect(effectsFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffectContracts'",
    )
    expect(effectsFile.source).not.toContain('Parameters<')
    expect(effectsFile.source).not.toContain('export type {')
    expect(effectContractsFile.source).toContain(
      'export type CanvasStandardCommandDocumentEffect',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasStandardCommandItemsChange',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasStandardCommandDocumentEffectContext',
    )
    expect(effectContractsFile.source).not.toContain(
      'applyCanvasStandardDocumentEffect',
    )
    expect(effectContractsFile.source).not.toContain('Parameters<')
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardDocumentEffect',
    )
    expect(effectsFile.source).toContain(
      'CANVAS_STANDARD_DOCUMENT_EFFECT_APPLIERS',
    )
    expect(effectsFile.source).not.toContain('switch (effect.kind)')
    expect(effectsFile.source).not.toContain(
      'assertUnhandledCanvasStandardDocumentEffect',
    )
    expect(effectsFile.source).toContain(
      'export function createCanvasStandardReplaceChangedEffect',
    )
    expect(effectsFile.source).toContain(
      'export function createCanvasStandardGroupSelectionEffect',
    )
    expect(executionFile.source).not.toContain('context.commitItemsChange(')
    expect(executionFile.source).not.toContain('context.commitSelection(')
    expect(executionFile.source).not.toContain('context.setEditing(null)')
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardItemsChangeEffect',
    )
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardHistoryEffect',
    )
    expect(effectsFile.source).toContain('context.commitItemsChange(')
    expect(effectsFile.source).toContain('context.commitSelection(')
    expect(effectsFile.source).toContain('context.setEditing(null)')
    expect(effectsFile.source).toContain('clearEditingIds.includes')
    expect(effectsFile.source).toContain("type: 'remove-selection'")
    expect(effectsFile.source).toContain("type: 'group-selection'")
  })


  it('keeps App clipboard command execution behind a named module', () => {
    const clipboardHookFile = getSourceFile(
      'src/canvas/app/commands/useCanvasClipboardCommands.ts',
    )
    const clipboardHandlersFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandHandlers.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandExecution.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandContracts.ts',
    )
    const effectPlanFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffectPlan.ts',
    )
    const effectContractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffectContracts.ts',
    )
    const resultEffectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandResultEffects.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffects.ts',
    )

    expect(clipboardHookFile.source).toContain(
      "from './CanvasClipboardCommandExecution'",
    )
    expect(clipboardHookFile.source).toContain(
      "from './CanvasClipboardCommandHandlers'",
    )
    for (const clipboardHandlerDetail of [
      "kind: 'clone'",
      "kind: 'copy'",
      "kind: 'cut'",
      "kind: 'duplicate'",
      "kind: 'paste'",
      'sourceIds: sourceIds ?? selection',
      'pasteIndex,',
    ]) {
      expect(clipboardHookFile.source).not.toContain(clipboardHandlerDetail)
      expect(clipboardHandlersFile.source).toContain(clipboardHandlerDetail)
    }
    expect(clipboardHookFile.source).not.toContain('getPasteIndex')
    expect(clipboardHandlersFile.source).toContain(
      'export function cloneCanvasClipboardItems',
    )
    expect(clipboardHandlersFile.source).toContain(
      'export function copyCanvasClipboardSelection',
    )
    expect(clipboardHandlersFile.source).toContain(
      'export function duplicateCanvasClipboardSelection',
    )
    expect(clipboardHookFile.source).not.toContain(
      'cloneCanvasCommandItems',
    )
    expect(clipboardHookFile.source).not.toContain(
      'duplicateCanvasCommand',
    )
    expect(clipboardHookFile.source).not.toContain('deleteCanvasCommand')
    expect(clipboardHookFile.source).not.toContain('getCanvasPasteOffset')
    expect(clipboardHookFile.source).not.toContain('copyItemsToClipboard(')
    expect(clipboardHookFile.source).not.toContain("type: 'remove-selection'")
    expect(executionFile.source).toContain(
      'export function executeCanvasClipboardCommand',
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandEffectPlan'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandContracts'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandEffects'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(executionFile.source).not.toContain(
      'export type { CanvasClipboardCommand',
    )
    expect(executionFile.source).toContain('applyCanvasClipboardCommandEffect')
    expect(executionFile.source).not.toContain('cloneCanvasCommandItems')
    expect(executionFile.source).not.toContain('duplicateCanvasCommand')
    expect(executionFile.source).not.toContain('deleteCanvasCommand')
    expect(executionFile.source).not.toContain('getCanvasPasteOffset')
    expect(executionFile.source).not.toContain('copyItemsToClipboard(')
    expect(executionFile.source).not.toContain("type: 'remove-selection'")
    expect(contractsFile.source).toContain(
      'export type CanvasClipboardCommand',
    )
    expect(contractsFile.source).toContain("kind: 'clone'")
    expect(contractsFile.source).toContain("kind: 'paste'")
    expect(contractsFile.source).not.toContain('cloneCanvasCommandItems')
    expect(contractsFile.source).not.toContain(
      'createCanvasClipboardCommandEffectPlan',
    )
    expect(contractsFile.source).not.toContain(
      'applyCanvasClipboardCommandEffect',
    )
    expect(effectPlanFile.source).toContain(
      'export function createCanvasClipboardCommandEffectPlan',
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasClipboardCommandContracts'",
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(effectPlanFile.source).not.toContain(
      'export type CanvasClipboardCommand =',
    )
    expect(effectPlanFile.source).toContain(
      'CANVAS_CLIPBOARD_COMMAND_EFFECT_PLANNERS',
    )
    expect(effectPlanFile.source).not.toContain('switch (command.kind)')
    expect(effectPlanFile.source).not.toContain(
      'assertUnhandledCanvasClipboardCommand',
    )
    expect(effectPlanFile.source).toContain('cloneCanvasCommandItems')
    expect(effectPlanFile.source).toContain('duplicateCanvasCommand')
    expect(effectPlanFile.source).toContain('deleteCanvasCommand')
    expect(effectPlanFile.source).toContain('getCanvasPasteOffset')
    expect(effectPlanFile.source).toContain(
      "from './CanvasClipboardCommandResultEffects'",
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasClipboardCopySelectionEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasClipboardDuplicateResultEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasClipboardCutSelectionResultEffect',
    )
    expect(effectPlanFile.source).not.toContain("kind: 'clone-result'")
    expect(effectPlanFile.source).not.toContain("kind: 'copy-selection'")
    expect(effectPlanFile.source).not.toContain("kind: 'add-items'")
    expect(effectPlanFile.source).not.toContain("kind: 'cut-selection'")
    expect(effectPlanFile.source).not.toContain("kind: 'cut-copy-only'")
    expect(effectPlanFile.source).not.toContain('copyItemsToClipboard(')
    expect(effectPlanFile.source).not.toContain("type: 'remove-selection'")
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasClipboardCopySelectionEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasClipboardDuplicateResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasClipboardCutSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(resultEffectsFile.source).toContain("kind: 'clone-result'")
    expect(resultEffectsFile.source).toContain("kind: 'copy-selection'")
    expect(resultEffectsFile.source).toContain("kind: 'add-items'")
    expect(resultEffectsFile.source).toContain("kind: 'cut-selection'")
    expect(resultEffectsFile.source).toContain("kind: 'cut-copy-only'")
    expect(resultEffectsFile.source).not.toContain('duplicateCanvasCommand')
    expect(resultEffectsFile.source).not.toContain('deleteCanvasCommand')
    expect(resultEffectsFile.source).not.toContain('getCanvasPasteOffset')
    expect(effectContractsFile.source).toContain(
      'export type CanvasClipboardCommandEffect',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasClipboardCommandExecutionResult',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasClipboardCommandEffectContext',
    )
    expect(effectContractsFile.source).not.toContain(
      'applyCanvasClipboardCommandEffect',
    )
    expect(effectContractsFile.source).not.toContain(
      'createCanvasClipboardCommandEffectPlan',
    )
    expect(effectsFile.source).toContain(
      'export function applyCanvasClipboardCommandEffect',
    )
    expect(effectsFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(effectsFile.source).not.toContain('export type {')
    expect(effectsFile.source).toContain(
      'CANVAS_CLIPBOARD_COMMAND_EFFECT_APPLIERS',
    )
    expect(effectsFile.source).not.toContain('switch (effect.kind)')
    expect(effectsFile.source).not.toContain(
      'assertUnhandledCanvasClipboardCommandEffect',
    )
    expect(effectsFile.source).toContain('copyItemsToClipboard(')
    expect(effectsFile.source).toContain('context.commitItemsChange(')
    expect(effectsFile.source).toContain('context.commitSelection(')
    expect(effectsFile.source).toContain("type: 'remove-selection'")
    expect(effectsFile.source).toContain('clearEditingIds.includes')
  })

})

import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App command execution boundaries', () => {
  it('keeps App custom command execution behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/extensions/custom-commands/CanvasAppCustomCommands.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/extensions/custom-commands/CanvasAppCustomCommandExecution.ts',
    )
    const extensionStateContractsFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionStateContracts.ts',
    )
    const extensionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppExtensionModel.ts',
    )
    const extensionConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionConsumerModel.ts',
    )
    const extensionConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionConsumerContracts.ts',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCommandExecution'",
    )
    expect(descriptorFile.source).not.toContain('CanvasWorkflowContract')
    expect(descriptorFile.source).not.toContain("from '../../host'")
    expect(descriptorFile.source).toContain(
      "from '../../workspace/document/CanvasAppDocumentContracts'",
    )
    expect(descriptorFile.source).toContain('CanvasAppDocumentAuthority')
    expect(descriptorFile.source).toContain(
      'document: CanvasAppDocumentAuthority',
    )
    expect(descriptorFile.source).not.toContain(
      'CanvasAppCustomCommandCommitItemsChange',
    )
    expect(descriptorFile.source).toContain(
      'export type CanvasAppCustomCommandCommitSelection',
    )
    expect(descriptorFile.source).not.toContain('command.run(')
    expect(descriptorFile.source).not.toContain('command.isEnabled(')
    expect(descriptorFile.source).not.toContain('try {')
    expect(executionFile.source).toContain('command.run(context)')
    expect(executionFile.source).toContain('command.isEnabled(context)')
    expect(executionFile.source).toContain('catch')
    expect(executionFile.source).not.toContain(
      'export type CanvasAppCustomCommandState',
    )
    expect(executionFile.source).toContain(
      "from '../CanvasAppExtensionStateContracts'",
    )
    expect(extensionStateContractsFile.source).toContain(
      'export type CanvasAppCustomCommandState',
    )
    expect(extensionModelFile.source).toContain(
      "from '../extensions/custom-commands'",
    )
    expect(extensionModelFile.source).toContain(
      "from './CanvasAppExtensionConsumerModel'",
    )
    expect(extensionModelFile.source).toContain(
      "from './CanvasAppExtensionConsumerContracts'",
    )
    expect(extensionModelFile.source).toContain(
      'CanvasAppExtensionModelInput',
    )
    expect(extensionModelFile.source).not.toContain(
      'type UseCanvasAppExtensionModelArgs',
    )
    expect(extensionModelFile.source).not.toContain('control: {')
    expect(extensionModelFile.source).not.toContain('keyboard: {')
    expect(extensionModelFile.source).not.toContain('pointer: {')
    expect(extensionConsumerModelFile.source).toContain(
      "from './CanvasAppExtensionConsumerContracts'",
    )
    expect(extensionConsumerModelFile.source).toContain(
      'export function getCanvasAppExtensionConsumerModel',
    )
    expect(extensionConsumerModelFile.source).not.toContain(
      'export type CanvasAppExtensionModel',
    )
    expect(extensionConsumerModelFile.source).toContain(
      '): CanvasAppExtensionModel',
    )
    expect(extensionConsumerModelFile.source).not.toContain('ReturnType<')
    expect(extensionConsumerContractsFile.source).toContain(
      'export type CanvasAppExtensionRuntime',
    )
    expect(extensionConsumerContractsFile.source).toContain(
      'export type CanvasAppExtensionModelInput',
    )
    expect(extensionConsumerContractsFile.source).toContain(
      "from '../extensions/CanvasAppExtensionStateContracts'",
    )
    expect(extensionConsumerContractsFile.source).toContain(
      "from '../extensions/custom-commands'",
    )
    expect(extensionConsumerContractsFile.source).not.toContain(
      'CanvasAppCustomCommandExecution',
    )
    expect(extensionConsumerContractsFile.source).toContain(
      'export type CanvasAppExtensionModel',
    )
    for (const extensionConsumerContract of [
      'CanvasAppExtensionControlContext',
      'CanvasAppExtensionKeyboardContext',
      'CanvasAppExtensionPointerContext',
    ]) {
      expect(extensionConsumerContractsFile.source).toContain(
        `export type ${extensionConsumerContract}`,
      )
    }
    expect(extensionConsumerModelFile.source).toContain('control: {')
    expect(extensionConsumerModelFile.source).toContain('keyboard: {')
    expect(extensionConsumerModelFile.source).toContain('pointer: {')
    expect(appModelFile.source).toContain(
      "from './useCanvasAppExtensionModel'",
    )
    expect(appModelFile.source).not.toContain(
      'CanvasAppCustomCommandExecution',
    )
    expect(appModelFile.source).not.toContain('customCommandStates')
    expect(appModelFile.source).not.toContain('customCreationToolStates')
    expect(appModelFile.source).not.toContain('runCustomCommand')
  })


  it('keeps App standard command execution behind a named module', () => {
    const commandHookFile = getSourceFile(
      'src/canvas/app/affordances/commands/useCanvasCommands.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/affordances/commands/CanvasStandardCommandExecution.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/affordances/commands/CanvasStandardCommandContracts.ts',
    )
    const effectPlanFile = getSourceFile(
      'src/canvas/app/affordances/commands/CanvasStandardCommandEffectPlan.ts',
    )
    const resultEffectsFile = getSourceFile(
      'src/canvas/app/affordances/commands/CanvasStandardCommandResultEffects.ts',
    )

    expect(commandHookFile.source).toContain(
      "from './CanvasStandardCommandExecution'",
    )
    expect(commandHookFile.source).not.toContain('alignCanvasCommand')
    expect(commandHookFile.source).not.toContain('deleteCanvasCommand')
    expect(commandHookFile.source).not.toContain('groupCanvasCommand')
    expect(commandHookFile.source).not.toContain('nudgeCanvasCommand')
    expect(commandHookFile.source).not.toContain('selectAllCanvasCommand')
    expect(commandHookFile.source).not.toContain("type: 'remove-selection'")
    expect(commandHookFile.source).not.toContain("type: 'group-selection'")
    expect(executionFile.source).toContain(
      'export function executeCanvasStandardCommand',
    )
    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandEffectPlan'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(executionFile.source).not.toContain(
      'export type { CanvasStandardCommand',
    )
    expect(executionFile.source).toContain(
      'applyCanvasStandardDocumentEffect',
    )
    expect(executionFile.source).not.toContain('alignCanvasCommand')
    expect(executionFile.source).not.toContain('deleteCanvasCommand')
    expect(executionFile.source).not.toContain('groupCanvasCommand')
    expect(executionFile.source).not.toContain('nudgeCanvasCommand')
    expect(executionFile.source).not.toContain('selectAllCanvasCommand')
    expect(executionFile.source).not.toContain("type: 'remove-selection'")
    expect(executionFile.source).not.toContain("type: 'group-selection'")
    expect(contractsFile.source).toContain(
      'export type CanvasStandardCommand',
    )
    expect(contractsFile.source).toContain("kind: 'align'")
    expect(contractsFile.source).toContain("kind: 'select-all'")
    expect(contractsFile.source).not.toContain('alignCanvasCommand')
    expect(contractsFile.source).not.toContain(
      'createCanvasStandardCommandEffectPlan',
    )
    expect(contractsFile.source).not.toContain(
      'applyCanvasStandardDocumentEffect',
    )
    expect(effectPlanFile.source).toContain(
      'export function createCanvasStandardCommandEffectPlan',
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffectContracts'",
    )
    expect(effectPlanFile.source).not.toContain(
      'export type CanvasStandardCommand =',
    )
    expect(effectPlanFile.source).toContain(
      'CANVAS_STANDARD_COMMAND_EFFECT_PLANNERS',
    )
    expect(effectPlanFile.source).not.toContain('switch (command.kind)')
    expect(effectPlanFile.source).not.toContain(
      'assertUnhandledCanvasStandardCommand',
    )
    expect(effectPlanFile.source).toContain('alignCanvasCommand')
    expect(effectPlanFile.source).toContain('deleteCanvasCommand')
    expect(effectPlanFile.source).toContain('groupCanvasCommand')
    expect(effectPlanFile.source).toContain('nudgeCanvasCommand')
    expect(effectPlanFile.source).toContain('selectAllCanvasCommand')
    expect(effectPlanFile.source).toContain(
      "from './CanvasStandardCommandResultEffects'",
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasStandardRemoveSelectionResultEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasStandardGroupSelectionResultEffect',
    )
    expect(effectPlanFile.source).not.toContain(
      'createCanvasStandardRemoveSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain(
      'createCanvasStandardGroupSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain(
      'createCanvasStandardUngroupSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain("type: 'remove-selection'")
    expect(effectPlanFile.source).not.toContain("type: 'group-selection'")
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasStandardRemoveSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasStandardGroupSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasStandardUngroupSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export type CanvasStandardSelectionResult',
    )
    expect(resultEffectsFile.source).not.toContain('Pick<')
    expect(resultEffectsFile.source).toContain(
      'createCanvasStandardRemoveSelectionEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'createCanvasStandardGroupSelectionEffect',
    )
    expect(resultEffectsFile.source).not.toContain('alignCanvasCommand')
    expect(resultEffectsFile.source).not.toContain('deleteCanvasCommand')
  })

})

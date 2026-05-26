import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App command workflow boundaries', () => {
  it('keeps built-in command selection thresholds in Engine command selection rules', () => {
    const actionFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandActions.ts',
    )
    const availabilityFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandAvailability.ts',
    )
    const availabilityRulesFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandAvailabilityRules.ts',
    )
    const rulesFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandSelectionRules.ts',
    )

    expect(actionFile.source).toContain(
      "from './CanvasCommandAvailabilityRules'",
    )
    expect(actionFile.source).toContain('canUseCanvasCommand')
    expect(actionFile.source).not.toContain('selection.length < 2')
    expect(actionFile.source).not.toContain('selection.length < 3')
    expect(availabilityFile.source).toContain(
      "from './CanvasCommandAvailabilityRules'",
    )
    expect(availabilityRulesFile.source).toContain(
      'CANVAS_COMMAND_AVAILABILITY_RULES',
    )
    expect(availabilityRulesFile.source).toContain(
      'type CanvasCommandAvailabilityRuleStateInput',
    )
    expect(availabilityRulesFile.source).toContain(
      'export function canUseCanvasCommand',
    )
    expect(availabilityRulesFile.source).toContain(
      'getCanvasCommandSelectionState',
    )
    expect(availabilityRulesFile.source).not.toContain(
      'selection.length > 1',
    )
    expect(availabilityRulesFile.source).not.toContain(
      'selection.length > 2',
    )
    expect(availabilityRulesFile.source).not.toContain('Omit<')
    expect(rulesFile.source).toContain(
      'CANVAS_COMMAND_SELECTION_MINIMUMS',
    )
    expect(rulesFile.source).toContain('align: 2')
    expect(rulesFile.source).toContain('distribute: 3')
  })


  it('keeps app command handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const commandModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppCommandModel.ts',
    )
    const commandConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppCommandConsumerModel.ts',
    )
    const commandConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppCommandConsumerContracts.ts',
    )
    const commandHookFile = getSourceFile(
      'src/canvas/app/commands/useCanvasCommands.ts',
    )
    const standardCommandHandlersFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandHandlers.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppCommandModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../commands/useCanvasCommands'",
    )
    expect(appModelFile.source).not.toContain('useCanvasCommands({')
    expect(commandModelFile.source).toContain(
      "from '../commands/useCanvasCommands'",
    )
    expect(commandModelFile.source).toContain(
      "from './CanvasAppCommandConsumerModel'",
    )
    expect(commandModelFile.source).toContain(
      "from './CanvasAppCommandConsumerContracts'",
    )
    expect(commandModelFile.source).toContain('CanvasAppCommandModelInput')
    expect(commandModelFile.source).not.toContain(
      'type CanvasAppCommandDocumentModel',
    )
    expect(commandModelFile.source).not.toContain(
      'type CanvasAppCommandWorkspaceModel',
    )
    expect(commandModelFile.source).toContain(
      'export function useCanvasAppCommandModel',
    )
    expect(commandModelFile.source).toContain(
      'commitItemsChange: document.commitItemsChange',
    )
    expect(commandModelFile.source).toContain(
      'setSelection: workspace.setSelection',
    )
    expect(commandModelFile.source).not.toContain('control: {')
    expect(commandModelFile.source).not.toContain('keyboard: {')
    expect(commandModelFile.source).not.toContain('pointer: {')
    expect(commandConsumerModelFile.source).toContain(
      'export function getCanvasAppCommandConsumerModel',
    )
    expect(commandConsumerModelFile.source).toContain(
      "from './CanvasAppControlCommandContracts'",
    )
    expect(commandConsumerModelFile.source).toContain(
      "from './CanvasAppCommandConsumerContracts'",
    )
    expect(commandConsumerModelFile.source).toContain(
      '): CanvasAppCommandConsumerModel',
    )
    expect(commandConsumerModelFile.source).toContain(
      'satisfies CanvasAppControlCommandHandlers',
    )
    expect(commandConsumerModelFile.source).not.toContain(
      'type CanvasAppCommandControlHandlers',
    )
    expect(commandConsumerModelFile.source).not.toContain(
      'type CanvasAppCommandRuntime',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandRuntime',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandModelInput',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandDocumentModel',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandWorkspaceModel',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandConsumerModel',
    )
    for (const commandConsumerContract of [
      'CanvasAppCommandControlContext',
      'CanvasAppCommandKeyboardContext',
      'CanvasAppCommandPointerContext',
    ]) {
      expect(commandConsumerContractsFile.source).toContain(
        `export type ${commandConsumerContract}`,
      )
    }
    expect(commandConsumerModelFile.source).toContain('control: {')
    expect(commandConsumerModelFile.source).toContain('keyboard: {')
    expect(commandConsumerModelFile.source).toContain('pointer: {')
    expect(appModelFile.source).not.toMatch(/commands\.\w+Selection/)
    expect(appModelFile.source).not.toContain('commands.cloneItems')
    expect(commandHookFile.source).toContain(
      "from './CanvasStandardCommandHandlers'",
    )
    expect(commandHookFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(standardCommandHandlersFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(standardCommandHandlersFile.source).not.toContain(
      "from './CanvasStandardCommandExecution'",
    )
    for (const standardCommandHandlerDetail of [
      "kind: 'align'",
      "kind: 'delete'",
      "kind: 'distribute'",
      "kind: 'group'",
      "kind: 'lock'",
      "kind: 'nudge'",
      "kind: 'redo'",
      "kind: 'reorder'",
      "kind: 'select-all'",
      "kind: 'undo'",
      "kind: 'ungroup'",
      "kind: 'unlock-all'",
    ]) {
      expect(commandHookFile.source).not.toContain(
        standardCommandHandlerDetail,
      )
      expect(standardCommandHandlersFile.source).toContain(
        standardCommandHandlerDetail,
      )
    }
    expect(standardCommandHandlersFile.source).toContain(
      'export function getCanvasStandardCommandHandlers',
    )
  })

})

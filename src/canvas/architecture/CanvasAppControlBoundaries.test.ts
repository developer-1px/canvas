import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App control boundaries', () => {
  it('keeps app control props behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const controlModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppControlModel.ts',
    )
    const controlCommandContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppControlCommandContracts.ts',
    )
    const consumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppControlConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain("from './CanvasAppControlModel'")
    expect(appModelFile.source).not.toContain(
      'getCanvasCommandAvailability',
    )
    expect(appModelFile.source).not.toContain(
      'CANVAS_GESTURE_STATUS_LABELS',
    )
    expect(appModelFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES')
    expect(appModelFile.source).not.toContain('selection.length > 1')
    expect(appModelFile.source).not.toContain('selection.length > 2')
    expect(controlModelFile.source).not.toContain('selection.length > 1')
    expect(controlModelFile.source).not.toContain('selection.length > 2')
    expect(controlModelFile.source).toContain(
      'export function getCanvasAppControlModel',
    )
    expect(controlModelFile.source).toContain(
      "from './CanvasAppControlConsumerContracts'",
    )
    expect(controlModelFile.source).toContain('CanvasAppControlModelInput')
    expect(controlModelFile.source).not.toContain(
      'type CanvasAppControlModelInput',
    )
    expect(controlModelFile.source).not.toContain(
      'type CanvasAppControlCommandHandlers',
    )
    expect(consumerContractsFile.source).toContain(
      'export type CanvasAppControlModelInput',
    )
    expect(consumerContractsFile.source).toContain(
      "from './CanvasAppControlCommandContracts'",
    )
    expect(controlCommandContractsFile.source).toContain(
      'export type CanvasAppControlCommandHandlers',
    )
    expect(controlCommandContractsFile.source).toContain('onAlign:')
    expect(controlCommandContractsFile.source).not.toContain(
      'getCanvasAppControlModel',
    )
    expect(controlModelFile.source).toContain(
      'getCanvasCommandAvailability',
    )
    expect(controlModelFile.source).toContain('commandAvailability')
    expect(controlModelFile.source).not.toContain(
      'getCanvasCommandSelectionState',
    )
    expect(controlModelFile.source).toContain(
      'CANVAS_GESTURE_STATUS_LABELS',
    )
    expect(controlModelFile.source).toContain('CANVAS_TOOL_AFFORDANCES')
  })

})

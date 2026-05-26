import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App viewport workflow boundaries', () => {
  it('keeps app viewport handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const viewportModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppViewportModel.ts',
    )
    const viewportConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppViewportConsumerModel.ts',
    )
    const viewportControlsHookFile = getSourceFile(
      'src/canvas/app/viewport/useCanvasViewportControls.ts',
    )
    const viewportControlExecutionFile = getSourceFile(
      'src/canvas/app/viewport/CanvasViewportControlExecution.ts',
    )
    const wheelViewportHookFile = getSourceFile(
      'src/canvas/app/viewport/useCanvasWheelViewport.ts',
    )
    const wheelViewportExecutionFile = getSourceFile(
      'src/canvas/app/viewport/CanvasWheelViewportExecution.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppViewportModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../viewport/useCanvasWheelViewport'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../viewport/useCanvasViewportControls'",
    )
    expect(appModelFile.source).not.toContain('useCanvasWheelViewport')
    expect(appModelFile.source).not.toContain('useCanvasViewportControls')
    expect(viewportModelFile.source).toContain(
      "from '../viewport/useCanvasWheelViewport'",
    )
    expect(viewportModelFile.source).toContain(
      "from '../viewport/useCanvasViewportControls'",
    )
    expect(viewportModelFile.source).toContain(
      "from './CanvasAppViewportConsumerModel'",
    )
    expect(viewportModelFile.source).toContain(
      "from './CanvasAppViewportConsumerContracts'",
    )
    expect(viewportModelFile.source).toContain(
      'CanvasAppViewportModelInput',
    )
    expect(viewportModelFile.source).not.toContain(
      'type UseCanvasAppViewportModelArgs',
    )
    expect(viewportModelFile.source).toContain(
      'export function useCanvasAppViewportModel',
    )
    expect(viewportModelFile.source).toContain('useCanvasWheelViewport')
    expect(viewportModelFile.source).toContain('useCanvasViewportControls')
    expect(viewportModelFile.source).not.toContain('control: {')
    expect(viewportModelFile.source).not.toContain('keyboard: {')
    expect(viewportConsumerModelFile.source).toContain(
      'export function getCanvasAppViewportConsumerModel',
    )
    expect(viewportConsumerModelFile.source).toContain(
      "from './CanvasAppViewportConsumerContracts'",
    )
    expect(viewportConsumerModelFile.source).toContain(
      '): CanvasAppViewportConsumerModel',
    )
    expect(viewportConsumerModelFile.source).not.toContain(
      'type CanvasAppViewportRuntime',
    )
    const viewportConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppViewportConsumerContracts.ts',
    )
    for (const viewportContract of [
      'CanvasAppViewportModelInput',
      'CanvasAppViewportRuntime',
      'CanvasAppViewportControlContext',
      'CanvasAppViewportConsumerModel',
    ]) {
      expect(viewportConsumerContractsFile.source).toContain(
        `export type ${viewportContract}`,
      )
    }
    expect(viewportConsumerModelFile.source).toContain('control: {')
    expect(viewportConsumerModelFile.source).toContain('keyboard: {')
    expect(appModelFile.source).not.toContain('viewportControls.fitToItems')
    expect(appModelFile.source).not.toContain('viewportControls.resetViewport')
    expect(appModelFile.source).not.toContain('viewportControls.zoomBy')
    expect(viewportControlsHookFile.source).toContain(
      "from './CanvasViewportControlExecution'",
    )
    for (const hookImplementationDetail of [
      'getAllIds',
      'fitBoundsIntoViewport',
      'INITIAL_VIEWPORT',
      'zoomViewport',
      'rect.width / 2',
    ]) {
      expect(viewportControlsHookFile.source).not.toContain(
        hookImplementationDetail,
      )
      expect(viewportControlExecutionFile.source).toContain(
        hookImplementationDetail,
      )
    }
    expect(viewportControlExecutionFile.source).toContain(
      'export function fitCanvasViewportToItems',
    )
    expect(viewportControlExecutionFile.source).toContain(
      'export function resetCanvasViewport',
    )
    expect(viewportControlExecutionFile.source).toContain(
      'export function zoomCanvasViewportBy',
    )
    expect(wheelViewportHookFile.source).toContain(
      "from './CanvasWheelViewportExecution'",
    )
    for (const wheelHookImplementationDetail of [
      'shouldHandleCanvasWheelViewport',
      'getCanvasWheelViewport',
      'type CanvasWheelInput',
      'preventDefault',
      'clientX - rect.left',
    ]) {
      expect(wheelViewportHookFile.source).not.toContain(
        wheelHookImplementationDetail,
      )
      expect(wheelViewportExecutionFile.source).toContain(
        wheelHookImplementationDetail,
      )
    }
    expect(wheelViewportExecutionFile.source).toContain(
      'export function runCanvasWheelViewport',
    )
  })

})

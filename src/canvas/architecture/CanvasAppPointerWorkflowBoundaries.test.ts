import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App pointer workflow boundaries', () => {
  it('keeps app pointer handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const pointerModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppPointerModel.ts',
    )
    const pointerConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppPointerConsumerModel.ts',
    )
    const pointerConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppPointerConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppPointerModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../affordances/interaction/pointer/useCanvasPointerDownHandlers'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../affordances/interaction/pointer/useCanvasPointerDragHandlers'",
    )
    expect(appModelFile.source).not.toContain('useCanvasPointerDownHandlers')
    expect(appModelFile.source).not.toContain('useCanvasPointerDragHandlers')
    expect(pointerModelFile.source).toContain(
      "from '../affordances/interaction/pointer/useCanvasPointerDownHandlers'",
    )
    expect(pointerModelFile.source).toContain(
      "from '../affordances/interaction/pointer/useCanvasPointerDragHandlers'",
    )
    expect(pointerModelFile.source).toContain(
      "from './CanvasAppPointerConsumerModel'",
    )
    expect(pointerModelFile.source).toContain(
      "from './CanvasAppPointerConsumerContracts'",
    )
    expect(pointerModelFile.source).toContain('CanvasAppPointerModelInput')
    expect(pointerModelFile.source).not.toContain(
      'type CanvasAppPointerCommandModel',
    )
    expect(pointerModelFile.source).not.toContain(
      'type CanvasAppPointerInteractionModel',
    )
    expect(pointerModelFile.source).not.toContain(
      'type CanvasAppPointerWorkspaceModel',
    )
    expect(pointerModelFile.source).not.toContain('itemLayerHandlers')
    expect(pointerModelFile.source).not.toContain('stageHandlers')
    expect(pointerConsumerModelFile.source).not.toContain(
      'type CanvasAppPointerDownRuntime',
    )
    expect(pointerConsumerModelFile.source).not.toContain(
      'type CanvasAppPointerDragRuntime',
    )
    expect(pointerConsumerModelFile.source).toContain(
      'export function getCanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerModelFile.source).toContain(
      "from './CanvasAppPointerConsumerContracts'",
    )
    expect(pointerConsumerModelFile.source).toContain(
      '): CanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerModelInput',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerDownRuntime',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerDragRuntime',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerConsumerModelInput',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'onCanvasPointerDown',
    )
    expect(pointerConsumerContractsFile.source).not.toContain(
      'downHandlers.handleCanvasPointerDown',
    )
    expect(pointerConsumerModelFile.source).toContain('itemLayerHandlers')
    expect(pointerConsumerModelFile.source).toContain('stageHandlers')
    expect(pointerConsumerModelFile.source).toContain(
      'onCanvasPointerDown: downHandlers.handleCanvasPointerDown',
    )
  })


  it('keeps app pointer input sources explicit instead of React event picks', () => {
    const pointerInputFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasAppPointerInput.ts',
    )

    expect(pointerInputFile.source).toContain(
      'export type CanvasAppScreenPointInput',
    )
    expect(pointerInputFile.source).toContain(
      'export type CanvasAppPointerIdInput',
    )
    expect(pointerInputFile.source).toContain(
      'export type CanvasAppPointerSource',
    )
    expect(pointerInputFile.source).not.toContain('Pick<')
    expect(pointerInputFile.source).not.toContain('PointerEvent<')
    expect(pointerInputFile.source).not.toContain('MouseEvent<')
  })

})

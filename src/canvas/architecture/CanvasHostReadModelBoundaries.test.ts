import { describe, expect, it } from 'vitest'

import { getSourceFile } from './CanvasArchitectureTestSources'

describe('Canvas host read model boundaries', () => {
  it('keeps Host item read model scene on the Engine scene adapter contract', () => {
    const readModelFile = getSourceFile(
      'src/canvas/host/read/CanvasItemReadModel.ts',
    )

    expect(readModelFile.source).toContain('CanvasSceneAdapter')
    expect(readModelFile.source).toContain('scene: CanvasSceneAdapter')
    expect(readModelFile.source).toContain('export function getCanvasItemIds')
    expect(readModelFile.source).toContain(
      'export function getCanvasValidSelection',
    )
    expect(readModelFile.source).not.toContain('ReturnType<')
  })

  it('keeps App item read model consumers behind an App-owned contract', () => {
    const appReadModelContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppItemReadModelContracts.ts',
    )
    const componentConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentConsumerContracts.ts',
    )
    const pointerConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppPointerConsumerContracts.ts',
    )
    const workspaceConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasWorkspaceConsumerContracts.ts',
    )

    expect(appReadModelContractsFile.source).toContain(
      'export type CanvasAppItemReadModel',
    )
    expect(appReadModelContractsFile.source).toContain("from '../../entities'")
    expect(appReadModelContractsFile.source).not.toContain("from '../../host'")
    expect(componentConsumerContractsFile.source).toContain(
      'CanvasAppItemReadModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'CanvasAppItemReadModel',
    )
    expect(workspaceConsumerContractsFile.source).toContain(
      'CanvasAppItemReadModel',
    )
    expect(componentConsumerContractsFile.source).not.toContain(
      'CanvasItemReadModel',
    )
    expect(pointerConsumerContractsFile.source).not.toContain(
      'CanvasItemReadModel',
    )
    expect(workspaceConsumerContractsFile.source).not.toContain(
      'CanvasItemReadModel',
    )
  })
})

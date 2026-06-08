import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas App stage boundaries', () => {
  it('keeps raw stage DOM operations inside the app stage element module', () => {
    const rawStageDomTerms =
      /\b(svgRef|RefObject<SVGSVGElement|stageElement\.current|getBoundingClientRect|hasPointerCapture|setPointerCapture|releasePointerCapture)\b|\b(?:addEventListener|removeEventListener)\(['"]wheel['"]/
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/rendering/stage/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx'),
      )
      .flatMap((file) =>
        rawStageDomTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps app stage element fan-out behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const stageElementModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppStageElementModel.ts',
    )
    const stageElementConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageElementConsumerModel.ts',
    )
    const stageElementConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageElementConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppStageElementModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../rendering/stage/CanvasAppStageElement'",
    )
    expect(appModelFile.source).not.toContain('stageElement.mount')
    expect(stageElementModelFile.source).toContain(
      "from '../rendering/stage/CanvasAppStageElement'",
    )
    expect(stageElementModelFile.source).toContain(
      "from './CanvasAppStageElementConsumerModel'",
    )
    expect(stageElementConsumerModelFile.source).toContain(
      "from './CanvasAppStageElementConsumerContracts'",
    )
    expect(stageElementConsumerModelFile.source).toContain(
      '): CanvasAppStageElementConsumerModel',
    )
    expect(stageElementConsumerModelFile.source).not.toContain(
      'CanvasAppStageElementController',
    )
    expect(stageElementConsumerContractsFile.source).toContain(
      'export type CanvasAppStageElementConsumerModelInput',
    )
    expect(stageElementConsumerContractsFile.source).toContain(
      'export type CanvasAppStageElementConsumerModel',
    )
    expect(stageElementConsumerContractsFile.source).toContain(
      "CanvasAppStageElementController['mount']",
    )
    for (const consumerContext of [
      'command: {',
      'component: {',
      'image: {',
      'linkPreview: {',
      'pointer: {',
      'stage: {',
      'stamp: {',
      'table: {',
      'textPaste: {',
      'viewport: {',
    ]) {
      expect(stageElementModelFile.source).not.toContain(consumerContext)
      expect(stageElementConsumerModelFile.source).toContain(consumerContext)
    }
    expect(stageElementConsumerModelFile.source).toContain(
      'export function getCanvasAppStageElementConsumerModel',
    )
    expect(stageElementConsumerModelFile.source).toContain(
      'stageElement: stageElement.mount',
    )
  })


  it('keeps app stage render input on the rendering contract seam', () => {
    const renderingContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRenderingContracts.ts',
    )
    const stageAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppStageAdapter.tsx',
    )
    const stageMount =
      renderingContractsFile.source.match(
        /export type CanvasAppStageMount = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''
    const stageAdapter =
      renderingContractsFile.source.match(
        /export type CanvasAppStageAdapter = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''
    const renderInput =
      renderingContractsFile.source.match(
        /export type CanvasAppStageRenderInput = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''

    expect(stageAdapterFile.source).toContain(
      "from './CanvasAppRenderingContracts'",
    )
    expect(stageAdapterFile.source).not.toContain(
      'export type CanvasAppStageRenderInput = {',
    )
    expect(stageMount).toContain('ref: RefCallback<Element>')
    expect(stageMount).not.toContain('SVGSVGElement')
    expect(stageAdapter).toContain('renderStage')
    expect(stageAdapter).not.toMatch(/\n\s+Stage:/)
    expect(stageAdapter).not.toContain('ComponentType')
    expect(renderInput).toContain('stageElement: CanvasAppStageMount')
    expect(renderInput).not.toContain('onStageElement')
    expect(renderInput).not.toContain('RefCallback<SVGSVGElement>')
    expect(renderInput).not.toContain('PointerEvent<')
    expect(renderInput).not.toContain('SVGSVGElement')
  })


  it('keeps app shell independent from stage adapter props', () => {
    const shellFile = getSourceFile('src/canvas/app/shell/CanvasAppView.tsx')

    expect(shellFile.source).not.toContain('CanvasAppStageRenderInput')
    expect(shellFile.source).not.toContain('ComponentType')
    expect(shellFile.source).not.toContain('createElement(stage.')
    expect(shellFile.source).toContain('showComponentPalette')
    expect(shellFile.source).toContain('showInspector')
    expect(shellFile.source).toContain('showTextEditor')
  })


  it('keeps app shell open to assembly input without exposing assembly construction to consumers', () => {
    const shellFile = getSourceFile('src/canvas/app/shell/CanvasApp.tsx')
    const assemblySourceFile = getSourceFile(
      'src/canvas/app/shell/CanvasAppAssemblySource.ts',
    )
    const appFacadeFile = getSourceFile('src/canvas/app/index.ts')
    const packageFacadeFile = getSourceFile('src/canvas/index.ts')
    const mainFile = getSourceFile('src/main.tsx')
    const rootFile = getSourceFile('src/CanvasRoot.tsx')

    expect(shellFile.source).toContain('resolveCanvasAppAssemblySource')
    expect(assemblySourceFile.source).toContain(
      'assemblyInput?: CanvasAppAssemblyInput',
    )
    expect(assemblySourceFile.source).toContain(
      'createCanvasAppAssembly(assemblyInput)',
    )
    expect(appFacadeFile.source).toContain('CanvasAppAssemblySource')
    expect(packageFacadeFile.source).toContain('CanvasAppAssemblySource')
    expect(mainFile.source).toContain('<CanvasRoot')
    expect(rootFile.source).toContain('CanvasDevToolsDemoApp')
    expect(rootFile.source).toContain('assemblyInput=')
    expect(mainFile.source).not.toContain('createCanvasAppAssembly')
    expect(rootFile.source).not.toContain('createCanvasAppAssembly')
  })


  it('keeps app stage rendering containment behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const stageModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageModel.tsx',
    )
    const stageConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageConsumerContracts.ts',
    )
    const pointerConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppPointerConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain("from './CanvasAppStageModel'")
    expect(appModelFile.source).not.toContain('adapter.renderStage(input)')
    expect(appModelFile.source).not.toContain('adapter.renderItems(input)')
    expect(appModelFile.source).not.toContain('itemLayerInput')
    expect(appModelFile.source).not.toContain('stageInput')
    expect(appModelFile.source).not.toContain('outlineIds')
    expect(appModelFile.source).not.toContain('onCanvasPointerDown')
    expect(appModelFile.source).not.toContain('onPointerCancel')
    expect(appModelFile.source).not.toContain('onPointerMove')
    expect(appModelFile.source).not.toContain('onPointerUp')
    expect(appModelFile.source).not.toContain('onResizePointerDown')
    expect(appModelFile.source).not.toContain('onContextMenu')
    expect(stageModelFile.source).toContain(
      'export function renderCanvasAppStageModel',
    )
    expect(stageModelFile.source).toContain(
      "from './CanvasAppStageConsumerContracts'",
    )
    expect(stageModelFile.source).not.toContain('Pick<')
    expect(stageModelFile.source).not.toContain(
      "'onItemPointerDown' | 'onTextDoubleClick'",
    )
    expect(stageModelFile.source).not.toContain(
      "| 'onCanvasPointerDown'",
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageModelInput',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageItemLayerContext',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageRenderingContext',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageContext',
    )
    expect(stageConsumerContractsFile.source).toContain(
      "from './CanvasAppPointerConsumerContracts'",
    )
    expect(stageConsumerContractsFile.source).not.toContain(
      'CanvasAppItemLayerRenderInput',
    )
    expect(stageConsumerContractsFile.source).not.toContain(
      'CanvasAppStageRenderInput',
    )
    expect(stageConsumerContractsFile.source).not.toContain(
      'renderCanvasAppStageModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerItemLayerHandlers',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerStageHandlers',
    )
    expect(pointerConsumerContractsFile.source).not.toContain(
      'getCanvasAppPointerConsumerModel',
    )
    expect(stageModelFile.source).toContain('adapter.renderStage(input)')
    expect(stageModelFile.source).toContain('adapter.renderItems(input)')
    expect(stageModelFile.source).toContain(
      'outlineIds: stage.overlays.itemOutlineIds',
    )
    expect(stageModelFile.source).toContain(
      'pointer.stageHandlers.onCanvasPointerDown',
    )
    expect(stageModelFile.source).toContain('blurTextEditor()')
    expect(stageModelFile.source).toContain('catch')
  })


  it('keeps app item layer render input on the rendering contract seam', () => {
    const renderingContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRenderingContracts.ts',
    )
    const itemLayerAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx',
    )
    const renderInput =
      renderingContractsFile.source.match(
        /export type CanvasAppItemLayerRenderInput = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''

    expect(itemLayerAdapterFile.source).toContain(
      "from './CanvasAppRenderingContracts'",
    )
    expect(itemLayerAdapterFile.source).not.toContain(
      'export type CanvasAppItemLayerRenderInput = {',
    )
    expect(renderInput).toContain('CanvasAppPointerInput')
    expect(renderInput).not.toContain('PointerEvent<')
    expect(renderInput).not.toContain('SVGGElement')
  })

})

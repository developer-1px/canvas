import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas rendering custom item boundaries', () => {
  it('keeps Demo SVG custom item render fallback behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererExecution.tsx',
    )
    const customRegistryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRenderFallback.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasDemoSvgCustomItemRendererExecution'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasDemoSvgCustomItemRendererExecution'",
    )
    expect(itemLayerFile.source).not.toContain(
      'getCanvasDemoSvgCustomItemRenderer',
    )
    expect(itemLayerFile.source).not.toContain(
      'renderCanvasDemoSvgCustomItemFallback',
    )
    expect(executionFile.source).toContain(
      'export function renderCanvasDemoSvgCustomItem',
    )
    expect(executionFile.source).toContain('getCanvasDemoSvgCustomItemRenderer')
    expect(executionFile.source).toContain(
      'renderCanvasDemoSvgCustomItemFallback',
    )
    expect(customRegistryFile.source).toContain(
      'getCanvasDemoSvgCustomItemFallbackRenderer',
    )
    expect(itemLayerFile.source).not.toContain('CanvasDemoSvgUnknownCustomItem')
    expect(customRegistryFile.source).not.toContain(
      'CanvasDemoSvgUnknownCustomItem',
    )
    expect(fallbackFile.source).toContain('CanvasDemoSvgUnknownCustomItem')
  })


  it('keeps Demo SVG custom item renderer contracts behind a named module', () => {
    const registryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistryContracts.ts',
    )
    const rendererRegistryContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistryContracts.ts',
    )

    expect(registryFile.source).toContain(
      "from './CanvasDemoSvgCustomItemRendererRegistryContracts'",
    )
    expect(registryFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(registryFile.source).not.toContain('render strategy')
    expect(contractsFile.source).toContain(
      'export function assertCanvasDemoSvgCustomItemRenderers',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppRendererRegistry',
    )
    expect(contractsFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(contractsFile.source).not.toContain('render strategy')
    expect(rendererRegistryContractsFile.source).toContain(
      'export function assertCanvasAppRendererRegistry',
    )
  })

})

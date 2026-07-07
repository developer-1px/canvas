import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas rendering custom item boundaries', () => {
  it('keeps Whiteboard SVG custom item render fallback behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemRenderRouting.tsx',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgCustomItemRendererExecution.tsx',
    )
    const customRegistryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgCustomItemRendererRegistry.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgCustomItemRenderFallback.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasWhiteboardSvgCustomItemRendererExecution'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasWhiteboardSvgCustomItemRendererExecution'",
    )
    expect(itemLayerFile.source).not.toContain(
      'getCanvasWhiteboardSvgCustomItemRenderer',
    )
    expect(itemLayerFile.source).not.toContain(
      'renderCanvasWhiteboardSvgCustomItemFallback',
    )
    expect(executionFile.source).toContain(
      'export function renderCanvasWhiteboardSvgCustomItem',
    )
    expect(executionFile.source).toContain('getCanvasWhiteboardSvgCustomItemRenderer')
    expect(executionFile.source).toContain(
      'renderCanvasWhiteboardSvgCustomItemFallback',
    )
    expect(customRegistryFile.source).toContain(
      'getCanvasWhiteboardSvgCustomItemFallbackRenderer',
    )
    expect(itemLayerFile.source).not.toContain('CanvasWhiteboardSvgUnknownCustomItem')
    expect(customRegistryFile.source).not.toContain(
      'CanvasWhiteboardSvgUnknownCustomItem',
    )
    expect(fallbackFile.source).toContain('CanvasWhiteboardSvgUnknownCustomItem')
  })


  it('keeps Whiteboard SVG custom item renderer contracts behind a named module', () => {
    const registryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgCustomItemRendererRegistry.tsx',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgCustomItemRendererRegistryContracts.ts',
    )
    const rendererRegistryContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistryContracts.ts',
    )

    expect(registryFile.source).toContain(
      "from './CanvasWhiteboardSvgCustomItemRendererRegistryContracts'",
    )
    expect(registryFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(registryFile.source).not.toContain('render strategy')
    expect(contractsFile.source).toContain(
      'export function assertCanvasWhiteboardSvgCustomItemRenderers',
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

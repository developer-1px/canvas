import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas rendering item boundaries', () => {
  it('keeps Demo SVG drawing item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const drawingRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderer.tsx',
    )
    const drawingRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderRouting.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasDemoSvgDrawingItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasDemoSvgDrawingItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('createCanvasSvgPathData')
    expect(itemLayerFile.source).not.toContain('createCanvasSvgFreehandPathData')
    expect(itemLayerFile.source).not.toContain('CANVAS_SVG_ARROW_MARKER_IRI')
    expect(itemLayerFile.source).not.toContain('className="arrow-item"')
    expect(drawingRendererFile.source).toContain(
      'export function renderCanvasDemoSvgDrawingItem',
    )
    expect(drawingRendererFile.source).toContain(
      'export function isCanvasDemoSvgDrawingItem',
    )
    expect(drawingRendererFile.source).toContain(
      "from './CanvasDemoSvgDrawingItemRenderRouting'",
    )
    expect(drawingRendererFile.source).not.toContain("item.type === 'arrow'")
    expect(drawingRendererFile.source).not.toContain('createCanvasSvgPathData')
    expect(drawingRendererFile.source).not.toContain(
      'createCanvasSvgFreehandPathData',
    )
    expect(drawingRendererFile.source).not.toContain(
      'CANVAS_SVG_ARROW_MARKER_IRI',
    )
    expect(drawingRoutingFile.source).toContain(
      'CANVAS_DEMO_SVG_DRAWING_ITEM_RENDER_STRATEGIES',
    )
    expect(drawingRoutingFile.source).toContain(
      'export function renderCanvasDemoSvgDrawingItemByRoute',
    )
    expect(drawingRoutingFile.source).toContain('createCanvasSvgArrowPathData')
    expect(drawingRoutingFile.source).toContain(
      'createCanvasSvgFreehandPathData',
    )
    expect(drawingRoutingFile.source).toContain('CANVAS_SVG_ARROW_MARKER_IRI')
  })


  it('keeps Demo SVG rect and text item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const rectTextRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderer.tsx',
    )
    const rectTextRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderRouting.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasDemoSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasDemoSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('className="rect-item"')
    expect(itemLayerFile.source).not.toContain('canvas-rect-text')
    expect(itemLayerFile.source).not.toContain('<foreignObject')
    expect(rectTextRendererFile.source).toContain(
      'export function renderCanvasDemoSvgRectTextItem',
    )
    expect(rectTextRendererFile.source).toContain(
      "from './CanvasDemoSvgRectTextItemRenderRouting'",
    )
    expect(rectTextRendererFile.source).not.toContain("item.type === 'rect'")
    expect(rectTextRendererFile.source).not.toContain('className="rect-item"')
    expect(rectTextRendererFile.source).not.toContain('canvas-rect-text')
    expect(rectTextRendererFile.source).not.toContain('<foreignObject')
    expect(rectTextRoutingFile.source).toContain(
      'CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES',
    )
    expect(rectTextRoutingFile.source).toContain(
      'export function renderCanvasDemoSvgRectTextItemByRoute',
    )
    expect(rectTextRoutingFile.source).toContain('isCanvasTextItem')
    expect(rectTextRoutingFile.source).toContain('className="rect-item"')
    expect(rectTextRoutingFile.source).toContain('canvas-rect-text')
    expect(rectTextRoutingFile.source).toContain('<foreignObject')
  })


  it('keeps Demo SVG component render fallback behind a named module', () => {
    const componentRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRenderer.tsx',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRendererExecution.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRenderFallback.tsx',
    )

    expect(componentRendererFile.source).toContain(
      "from './CanvasDemoSvgComponentRendererExecution'",
    )
    expect(componentRendererFile.source).not.toContain(
      'getCanvasDemoSvgComponentPresentationRenderer',
    )
    expect(componentRendererFile.source).not.toContain(
      'renderCanvasDemoSvgComponentFallback',
    )
    expect(executionFile.source).toContain(
      'export function renderCanvasDemoSvgComponentPresentation',
    )
    expect(executionFile.source).toContain(
      'getCanvasDemoSvgComponentPresentationRenderer',
    )
    expect(executionFile.source).toContain(
      'renderCanvasDemoSvgComponentFallback',
    )
    expect(componentRendererFile.source).not.toMatch(
      /DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS\[['"]/,
    )
    expect(componentRendererFile.source).not.toContain(
      'CanvasDemoSvgCardComponent',
    )
    expect(fallbackFile.source).toContain(
      'CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION',
    )
    expect(fallbackFile.source).toContain('CanvasDemoSvgCardComponent')
  })


  it('keeps Demo SVG component presentation defaults and contracts behind named modules', () => {
    const registryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistry.ts',
    )
    const defaultsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgBuiltInComponentPresentationRenderers.tsx',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistryContracts.ts',
    )
    const rendererRegistryContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistryContracts.ts',
    )

    expect(registryFile.source).toContain(
      "from './CanvasDemoSvgBuiltInComponentPresentationRenderers'",
    )
    expect(registryFile.source).toContain(
      "from './CanvasDemoSvgComponentPresentationRegistryContracts'",
    )
    expect(registryFile.source).not.toContain(
      'CanvasDemoSvgChecklistComponent',
    )
    expect(registryFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(defaultsFile.source).toContain(
      'DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS',
    )
    expect(defaultsFile.source).toContain('CanvasDemoSvgChecklistComponent')
    expect(defaultsFile.source).toContain("'note-card'")
    expect(contractsFile.source).toContain(
      'export function assertCanvasDemoSvgComponentPresentationRenderers',
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
    expect(rendererRegistryContractsFile.source).toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(rendererRegistryContractsFile.source).toContain('render strategy')
  })

})

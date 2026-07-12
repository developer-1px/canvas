import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas rendering item boundaries', () => {
  it('keeps Whiteboard SVG drawing item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemRenderRouting.tsx',
    )
    const drawingRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgDrawingItemRenderer.tsx',
    )
    const drawingRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgDrawingItemRenderRouting.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasWhiteboardSvgDrawingItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasWhiteboardSvgDrawingItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('createCanvasSvgPathData')
    expect(itemLayerFile.source).not.toContain('createCanvasSvgFreehandPathData')
    expect(itemLayerFile.source).not.toContain('CANVAS_SVG_ARROW_MARKER_IRI')
    expect(itemLayerFile.source).not.toContain('className="arrow-item"')
    expect(drawingRendererFile.source).toContain(
      'export function renderCanvasWhiteboardSvgDrawingItem',
    )
    expect(drawingRendererFile.source).toContain(
      'export function isCanvasWhiteboardSvgDrawingItem',
    )
    expect(drawingRendererFile.source).toContain(
      "from './CanvasWhiteboardSvgDrawingItemRenderRouting'",
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
      'CANVAS_WHITEBOARD_SVG_DRAWING_ITEM_RENDER_STRATEGIES',
    )
    expect(drawingRoutingFile.source).toContain(
      'export function renderCanvasWhiteboardSvgDrawingItemByRoute',
    )
    expect(drawingRoutingFile.source).toContain('createCanvasSvgArrowPathData')
    expect(drawingRoutingFile.source).toContain(
      'createCanvasSvgFreehandPathData',
    )
    expect(drawingRoutingFile.source).toContain('CANVAS_SVG_ARROW_MARKER_IRI')
  })


  it('keeps Whiteboard SVG rect and text item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemRenderRouting.tsx',
    )
    const rectTextRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgRectTextItemRenderer.tsx',
    )
    const rectTextRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgRectTextItemRenderRouting.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasWhiteboardSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasWhiteboardSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('className="shape-item"')
    expect(itemLayerFile.source).not.toContain('canvas-shape-text')
    expect(itemLayerFile.source).not.toContain('<foreignObject')
    expect(rectTextRendererFile.source).toContain(
      'export function renderCanvasWhiteboardSvgRectTextItem',
    )
    expect(rectTextRendererFile.source).toContain(
      "from './CanvasWhiteboardSvgRectTextItemRenderRouting'",
    )
    expect(rectTextRendererFile.source).not.toContain("item.type === 'rect'")
    expect(rectTextRendererFile.source).not.toContain('className="shape-item"')
    expect(rectTextRendererFile.source).not.toContain('canvas-shape-text')
    expect(rectTextRendererFile.source).not.toContain('<foreignObject')
    expect(rectTextRoutingFile.source).toContain(
      'CANVAS_WHITEBOARD_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES',
    )
    expect(rectTextRoutingFile.source).toContain(
      'export function renderCanvasWhiteboardSvgRectTextItemByRoute',
    )
    expect(rectTextRoutingFile.source).toContain('isCanvasTextItem')
    expect(rectTextRoutingFile.source).toContain('className="shape-item"')
    expect(rectTextRoutingFile.source).toContain('canvas-shape-text')
    expect(rectTextRoutingFile.source).toContain('<foreignObject')
  })


  it('keeps Whiteboard SVG component render fallback behind a named module', () => {
    const componentRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgComponentRenderer.tsx',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgComponentRendererExecution.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgComponentRenderFallback.tsx',
    )

    expect(componentRendererFile.source).toContain(
      "from './CanvasWhiteboardSvgComponentRendererExecution'",
    )
    expect(componentRendererFile.source).not.toContain(
      'getCanvasWhiteboardSvgComponentPresentationRenderer',
    )
    expect(componentRendererFile.source).not.toContain(
      'renderCanvasWhiteboardSvgComponentFallback',
    )
    expect(executionFile.source).toContain(
      'export function renderCanvasWhiteboardSvgComponentPresentation',
    )
    expect(executionFile.source).toContain(
      'getCanvasWhiteboardSvgComponentPresentationRenderer',
    )
    expect(executionFile.source).toContain(
      'renderCanvasWhiteboardSvgComponentFallback',
    )
    expect(componentRendererFile.source).not.toMatch(
      /DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS\[['"]/,
    )
    expect(componentRendererFile.source).not.toContain(
      'CanvasWhiteboardSvgCardComponent',
    )
    expect(fallbackFile.source).toContain(
      'CANVAS_WHITEBOARD_SVG_COMPONENT_FALLBACK_PRESENTATION',
    )
    expect(fallbackFile.source).toContain('CanvasWhiteboardSvgCardComponent')
  })


  it('keeps Whiteboard SVG component presentation defaults and contracts behind named modules', () => {
    const registryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgComponentPresentationRegistry.ts',
    )
    const defaultsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgBuiltInComponentPresentationRenderers.tsx',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgComponentPresentationRegistryContracts.ts',
    )
    const rendererRegistryContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistryContracts.ts',
    )
    const stickyAdapterFile = getSourceFile(
      'src/canvas/app/extensions/foundation-extensions/CanvasAppStickyNoteCapabilityAdapter.ts',
    )

    expect(registryFile.source).toContain(
      "from './CanvasWhiteboardSvgBuiltInComponentPresentationRenderers'",
    )
    expect(registryFile.source).toContain(
      "from './CanvasWhiteboardSvgComponentPresentationRegistryContracts'",
    )
    expect(registryFile.source).not.toContain(
      'CanvasWhiteboardSvgChecklistComponent',
    )
    expect(registryFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(defaultsFile.source).toContain(
      'DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS',
    )
    expect(defaultsFile.source).toContain('CanvasWhiteboardSvgChecklistComponent')
    expect(defaultsFile.source).not.toContain("'note-card'")
    expect(stickyAdapterFile.source).toContain("presentation: 'note-card'")
    expect(contractsFile.source).toContain(
      'export function assertCanvasWhiteboardSvgComponentPresentationRenderers',
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

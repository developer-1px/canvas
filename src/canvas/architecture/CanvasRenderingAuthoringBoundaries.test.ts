import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas rendering authoring boundaries', () => {
  it('keeps app rendering authoring contracts independent from Whiteboard SVG registry names', () => {
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRenderingContracts.ts',
    )
    const registriesFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistries.ts',
    )
    const itemLayerAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx',
    )
    const authoringFacadeFile = getSourceFile(
      'src/canvas/app/authoring/index.ts',
    )
    const workflowFacadeFile = getSourceFile(
      'src/canvas/app/workflow/index.ts',
    )

    expect(contractsFile.source).toContain(
      'CanvasAppComponentRendererStrategy',
    )
    expect(contractsFile.source).toContain(
      'CanvasAppCustomItemRendererStrategy',
    )
    expect(contractsFile.source).toContain('CanvasAppStageRenderInput')
    expect(contractsFile.source).toContain(
      'CanvasAppItemLayerRenderInput',
    )
    expect(contractsFile.source).toContain(
      'renderStage: (input: CanvasAppStageRenderInput)',
    )
    expect(contractsFile.source).toContain(
      'renderItems: (input: CanvasAppItemLayerRenderInput)',
    )
    expect(contractsFile.source).not.toContain('CanvasWhiteboardSvg')
    expect(contractsFile.source).not.toContain("from '../../host'")
    expect(registriesFile.source).toContain(
      'export function createCanvasAppComponentPresentationRenderers',
    )
    expect(registriesFile.source).toContain(
      'export function createCanvasAppCustomItemRenderers',
    )
    expect(registriesFile.source).toContain(
      "from './CanvasWhiteboardSvgComponentPresentationRegistry'",
    )
    expect(registriesFile.source).toContain(
      "from './CanvasWhiteboardSvgCustomItemRendererRegistry'",
    )
    expect(registriesFile.source).not.toContain('Parameters<typeof')
    expect(registriesFile.source).not.toContain('export type {')
    expect(authoringFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRendererRegistries'",
    )
    expect(authoringFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRenderingContracts'",
    )
    expect(authoringFacadeFile.source).not.toContain(
      "from '../rendering/CanvasAppStageAdapter'",
    )
    expect(authoringFacadeFile.source).not.toContain(
      "from '../rendering/CanvasAppItemLayerAdapter'",
    )
    expect(workflowFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRendererRegistries'",
    )
    expect(workflowFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRenderingContracts'",
    )
    expect(workflowFacadeFile.source).not.toContain(
      "from '../rendering/CanvasAppStageAdapter'",
    )
    expect(workflowFacadeFile.source).not.toContain(
      "from '../rendering/CanvasAppItemLayerAdapter'",
    )
    expect(authoringFacadeFile.source).not.toContain("from '../rendering'")
    expect(itemLayerAdapterFile.source).not.toMatch(
      /CanvasWhiteboardSvg(?:Component|Custom).*Renderer/,
    )
  })


  it('keeps shared svg drawing primitives in the renderer module', () => {
    const primitiveFile =
      getSourceFile('src/canvas/renderer/svg/CanvasSvgDrawingPrimitives.ts')
    const hardcodedSvgDrawingTerms =
      /\bcreateSvgPathData\b|canvas-arrow-head|canvas-draft-arrow-head|url\(#canvas-/
    const violations = sourceFiles
      .filter((file) =>
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx') &&
        file.path !== primitiveFile.path,
      )
      .flatMap((file) =>
        hardcodedSvgDrawingTerms.test(file.source) ? [file.path] : [],
      )

    expect(primitiveFile.source).toContain('createCanvasSvgPathData')
    expect(primitiveFile.source).toContain('CANVAS_SVG_ARROW_MARKER_IRI')
    expect(primitiveFile.source).toContain('CANVAS_SVG_DRAFT_ARROW_MARKER_IRI')
    expect(violations).toEqual([])
  })


  it('keeps Whiteboard SVG item frame concerns out of item rendering branches', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemLayer.tsx',
    )
    const itemRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemRenderer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemRenderRouting.tsx',
    )
    const itemFrameFile = getSourceFile(
      'src/canvas/app/rendering/CanvasWhiteboardSvgItemFrame.tsx',
    )

    expect(itemLayerFile.source).toContain(
      "from './CanvasWhiteboardSvgItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('CanvasWhiteboardSvgItemFrame')
    expect(itemLayerFile.source).not.toContain("item.type === '")
    expect(itemRendererFile.source).toContain('CanvasWhiteboardSvgItemFrame')
    expect(itemRendererFile.source).toContain(
      'export function renderCanvasWhiteboardSvgItem',
    )
    expect(itemRendererFile.source).toContain(
      "from './CanvasWhiteboardSvgItemRenderRouting'",
    )
    expect(itemRendererFile.source).not.toContain("item.type === '")
    expect(itemRenderRoutingFile.source).toContain(
      'CANVAS_WHITEBOARD_SVG_ITEM_RENDER_STRATEGIES',
    )
    expect(itemRenderRoutingFile.source).toContain(
      'export function getCanvasWhiteboardSvgItemRenderRoute',
    )
    expect(itemLayerFile.source).not.toContain('data-locked')
    expect(itemLayerFile.source).not.toContain('data-selected')
    expect(itemLayerFile.source).not.toContain('pointerEvents')
    expect(itemLayerFile.source).not.toContain('item-outline')
    expect(itemFrameFile.source).toContain('data-locked')
    expect(itemFrameFile.source).toContain('data-selected')
    expect(itemFrameFile.source).toContain('pointerEvents')
    expect(itemFrameFile.source).toContain('item-outline')
  })

})

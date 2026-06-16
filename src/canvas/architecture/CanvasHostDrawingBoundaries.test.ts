import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas host drawing boundaries', () => {
  it('keeps built-in drawing geometry in the host drawing module', () => {
    const drawingGeometryModule = getSourceFile(
      'src/canvas/host/drawing/CanvasDrawingItemGeometry.ts',
    )
    const arrowRoutingModule = getSourceFile(
      'src/canvas/host/drawing/CanvasArrowRouting.ts',
    )
    const hostEntryFile = getSourceFile('src/canvas/host/index.ts')
    const treeBoundsFile = getSourceFile(
      'src/canvas/host/tree/CanvasTreeBounds.ts',
    )
    const cloneOperationsFile = getSourceFile(
      'src/canvas/host/operations/CanvasItemCloneOperations.ts',
    )
    const transformOperationsFile = getSourceFile(
      'src/canvas/host/operations/CanvasItemTransformOperations.ts',
    )
    const drawingRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderer.tsx',
    )
    const arrowRoutingInspectorFile = getSourceFile(
      'src/canvas/app/feature-packs/arrow-routing-inspector/CanvasArrowRoutingInspectorPanel.tsx',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )
    const defaultFeaturePacksFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppDefaultFeaturePacks.ts',
    )
    const arrowRoutingIndexFile = getSourceFile(
      'src/canvas/app/feature-packs/arrow-routing-inspector/index.ts',
    )

    expect(drawingGeometryModule.source).toContain(
      'export function isCanvasDrawingItem',
    )
    expect(drawingGeometryModule.source).toContain(
      'export function getCanvasDrawingItemBounds',
    )
    expect(drawingGeometryModule.source).toContain(
      'export function translateCanvasDrawingItem',
    )
    expect(drawingGeometryModule.source).toContain(
      'export function scaleCanvasDrawingItem',
    )
    expect(arrowRoutingModule.source).toContain(
      'export function replaceCanvasArrowRoutings',
    )
    expect(drawingGeometryModule.source).not.toContain(
      'replaceCanvasArrowRoutings',
    )
    expect(hostEntryFile.source).toContain(
      "from './drawing/CanvasDrawingItemGeometry'",
    )
    expect(hostEntryFile.source).toContain(
      "from './drawing/CanvasArrowRouting'",
    )
    expect(hostEntryFile.source).toContain('replaceCanvasArrowRoutings')
    expect(arrowRoutingInspectorFile.source).toContain(
      'replaceCanvasArrowRoutings',
    )
    expect(defaultAssemblyFile.source).toContain("from '../feature-packs'")
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE',
    )
    expect(defaultAssemblyFile.source).not.toContain(
      'CANVAS_ARROW_ROUTING_INSPECTOR_PANEL',
    )
    expect(defaultFeaturePacksFile.source).toContain(
      "from './arrow-routing-inspector'",
    )
    expect(defaultFeaturePacksFile.source).toContain(
      'CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK',
    )
    expect(defaultFeaturePacksFile.source).not.toContain(
      'CANVAS_ARROW_ROUTING_INSPECTOR_PANEL',
    )
    expect(arrowRoutingIndexFile.source).toContain(
      'CANVAS_ARROW_ROUTING_INSPECTOR_PANEL',
    )
    expect(arrowRoutingIndexFile.source).toContain(
      'CANVAS_APP_ARROW_ROUTING_INSPECTOR_FEATURE_PACK',
    )
    for (const hostConsumer of [
      treeBoundsFile,
      cloneOperationsFile,
      transformOperationsFile,
    ]) {
      expect(hostConsumer.source).toContain(
        "from '../drawing/CanvasDrawingItemGeometry'",
      )
      expect(hostConsumer.source).not.toContain(
        "item.type === 'marker' || item.type === 'highlight'",
      )
      expect(hostConsumer.source).not.toContain("item.type === 'arrow'")
    }
    expect(treeBoundsFile.source).not.toContain('CANVAS_ARROW_BOUNDS_PAD')
    expect(cloneOperationsFile.source).not.toContain('points: item.points.map')
    expect(transformOperationsFile.source).not.toContain('scalePointsToBounds')
    expect(drawingRendererFile.source).toContain(
      "from '../../host'",
    )
    expect(drawingRendererFile.source).toContain('isCanvasDrawingItem(item)')
    expect(drawingRendererFile.source).not.toContain(
      "item.type === 'marker' ||",
    )
  })


  it('keeps built-in drawing style defaults in the host drawing module', () => {
    const drawingStyleModule = getSourceFile(
      'src/canvas/host/drawing/CanvasDrawingItemStyles.ts',
    )
    const drawingStyleConsumers = [
      getSourceFile('src/canvas/app/affordances/interaction/pointer/CanvasPointerDrawing.ts'),
      getSourceFile('src/canvas/host/adapters/CanvasItemCreationAdapter.ts'),
    ].map((file) => file.source).join('\n')

    expect(drawingStyleModule.source).toContain('CANVAS_MARKER_STYLE')
    expect(drawingStyleModule.source).toContain('CANVAS_HIGHLIGHT_STYLE')
    expect(drawingStyleModule.source).toContain('CANVAS_ARROW_STYLE')
    expect(drawingStyleModule.source).toContain(
      'export type CanvasDrawingStrokeStyle',
    )
    expect(drawingStyleModule.source).toContain(
      'export type CanvasArrowStyle',
    )
    expect(drawingStyleModule.source).not.toContain('Pick<')
    expect(drawingStyleModule.source).not.toContain("from '../model'")
    expect(drawingStyleConsumers).not.toContain('#475569')
    expect(drawingStyleConsumers).not.toContain('#fde047')
    expect(drawingStyleConsumers).not.toContain('#334155')
  })


  it('keeps built-in drawing item validation in the host drawing module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const drawingValidationFile = getSourceFile(
      'src/canvas/host/drawing/CanvasDrawingItemValidation.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../drawing/CanvasDrawingItemValidation'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasDrawingItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).not.toContain('function isOpacity')
    expect(itemSchemaFile.source).not.toContain('function isDrawingPointArray')
    expect(itemSchemaFile.source).not.toContain('function isSamePoint')
    expect(itemSchemaFile.source).not.toContain(
      "value.type === 'marker' || value.type === 'highlight'",
    )
    expect(itemSchemaFile.source).not.toContain("value.type === 'arrow'")
    expect(drawingValidationFile.source).toContain(
      'export function isCanvasDrawingItemStorageShape',
    )
    expect(drawingValidationFile.source).toContain('function isOpacity')
    expect(drawingValidationFile.source).toContain(
      'function isDrawingPointArray',
    )
    expect(drawingValidationFile.source).toContain('function isSamePoint')
  })


  it('keeps built-in collaboration and stamp item rules behind host modules', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const attachmentFile = getSourceFile(
      'src/canvas/host/attachment/CanvasItemAttachment.ts',
    )
    const commentFile = getSourceFile(
      'src/canvas/host/comment/CanvasCommentItem.ts',
    )
    const stampFile = getSourceFile('src/canvas/host/stamp/CanvasStampItem.ts')
    const transformOperationsFile = getSourceFile(
      'src/canvas/host/operations/CanvasItemTransformOperations.ts',
    )
    const stampInsertionFile = getSourceFile(
      'src/canvas/app/feature-packs/stamp-authoring/CanvasStampInsertion.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../stamp/CanvasStampItem'",
    )
    expect(itemSchemaFile.source).toContain(
      "from '../comment/CanvasCommentItem'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasStampItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasCommentItemStorageShape(value)',
    )
    expect(attachmentFile.source).toContain(
      'export function isCanvasItemAttachedTo',
    )
    expect(commentFile.source).toContain(
      'export function isCanvasCommentAttachedTo',
    )
    expect(commentFile.source).toContain(
      'export function translateCanvasCommentItem',
    )
    expect(stampFile.source).not.toContain(
      'export function isCanvasStampAttachedTo',
    )
    expect(stampFile.source).toContain(
      'export function translateCanvasStampItem',
    )
    expect(transformOperationsFile.source).toContain(
      "from '../attachment/CanvasItemAttachment'",
    )
    expect(transformOperationsFile.source).toContain(
      'isCanvasItemAttachedTo(item, movableSelected)',
    )
    expect(transformOperationsFile.source).not.toContain(
      "item.type === 'stamp'",
    )
    expect(transformOperationsFile.source).not.toContain(
      "item.type === 'comment'",
    )
    expect(stampInsertionFile.source).not.toContain('attachedTo')
    expect(stampInsertionFile.source).toContain('after: [item.id]')
  })

})

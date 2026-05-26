import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas pointer preview boundaries', () => {
  it('keeps pointer interaction preview rules behind a named module', () => {
    const dragHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDragHandlers.ts',
    )
    const previewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionPreview.ts',
    )
    const resultContractsFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionResultContracts.ts',
    )
    const interactionRoutingFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionRouting.ts',
    )
    const creationPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationPreview.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )
    const shapeCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerShapeCreation.ts',
    )
    const shapeCreationDescriptorsFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerShapeCreationDescriptors.ts',
    )
    const marqueeInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerMarqueeInteraction.ts',
    )
    const panInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerPanInteraction.ts',
    )
    const transformPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerTransformPreview.ts',
    )
    const movementFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionMovement.ts',
    )

    expect(dragHandlersFile.source).toContain(
      "from './CanvasPointerInteractionPreview'",
    )
    expect(dragHandlersFile.source).not.toContain('getCanvasMoveSnap')
    expect(dragHandlersFile.source).not.toContain('resizeCanvasSelection')
    expect(dragHandlersFile.source).not.toContain('getCanvasMarqueeSelection')
    expect(dragHandlersFile.source).not.toContain('getNextCanvasDrawingPoints')
    expect(dragHandlersFile.source).not.toContain('DRAG_THRESHOLD')
    expect(previewFile.source).toContain(
      "from './CanvasPointerCreationPreview'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerTransformPreview'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerMarqueeInteraction'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerPanInteraction'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerInteractionRouting'",
    )
    expect(previewFile.source).toContain(
      'export function previewCanvasPointerInteraction',
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerInteractionResultContracts'",
    )
    expect(previewFile.source).not.toContain(
      'export type CanvasPointerInteractionPreviewResult',
    )
    expect(previewFile.source).not.toContain("interaction.kind === 'pan'")
    expect(previewFile.source).not.toContain("interaction.kind === 'move'")
    expect(previewFile.source).not.toContain("interaction.kind === 'resize'")
    expect(previewFile.source).not.toContain(
      "interaction.kind === 'marquee'",
    )
    expect(interactionRoutingFile.source).toContain(
      'export function routeCanvasPointerInteraction',
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'pan'",
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'move' || interaction.kind === 'resize'",
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'marquee'",
    )
    expect(previewFile.source).not.toContain('EMPTY_CANVAS_SNAP_GUIDES')
    expect(previewFile.source).not.toContain('config.gestures.pan')
    expect(previewFile.source).not.toContain('interaction.origin.x + dx')
    expect(previewFile.source).not.toContain('getCanvasMoveSnap')
    expect(previewFile.source).not.toContain('resizeCanvasSelection')
    expect(previewFile.source).not.toContain('moveCanvasSelection')
    expect(previewFile.source).not.toContain('getCanvasMarqueeSelection')
    expect(previewFile.source).not.toContain('getNextCanvasDrawingPoints')
    expect(previewFile.source).not.toContain('createCanvasDraftStroke')
    expect(previewFile.source).not.toContain('DRAG_THRESHOLD')
    expect(creationPreviewFile.source).toContain(
      'export function previewCanvasPointerCreation',
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerInteractionResultContracts'",
    )
    expect(creationPreviewFile.source).not.toContain(
      'export type CanvasPointerCreationPreviewResult',
    )
    expect(resultContractsFile.source).toContain(
      'export type CanvasPointerInteractionPreviewResult',
    )
    expect(resultContractsFile.source).toContain(
      'export type CanvasPointerCreationPreviewResult',
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerDrawingCreation'",
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerCustomCreation'",
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerShapeCreation'",
    )
    expect(creationPreviewFile.source).not.toContain(
      'getNextCanvasDrawingPoints',
    )
    expect(creationPreviewFile.source).not.toContain(
      'createCanvasDraftStroke',
    )
    expect(drawingCreationFile.source).toContain(
      'getNextCanvasDrawingPoints',
    )
    expect(drawingCreationFile.source).toContain('createCanvasDraftStroke')
    expect(shapeCreationDescriptorsFile.source).toContain('normalizeBounds')
    expect(shapeCreationFile.source).toContain('snapCanvasPointToGrid')
    expect(customCreationFile.source).toContain('snapCanvasPointToGrid')
    expect(customCreationFile.source).toContain('hasCanvasInteractionMoved')
    expect(marqueeInteractionFile.source).toContain(
      'export function previewCanvasPointerMarqueeInteraction',
    )
    expect(marqueeInteractionFile.source).toContain('getCanvasMarqueeSelection')
    expect(marqueeInteractionFile.source).toContain('normalizeBounds')
    expect(marqueeInteractionFile.source).toContain(
      'hasCanvasInteractionMoved',
    )
    expect(panInteractionFile.source).toContain(
      'export function previewCanvasPointerPanInteraction',
    )
    expect(panInteractionFile.source).toContain('EMPTY_CANVAS_SNAP_GUIDES')
    expect(panInteractionFile.source).toContain('config.gestures.pan')
    expect(panInteractionFile.source).toContain('interaction.origin.x + dx')
    expect(transformPreviewFile.source).toContain(
      'export function previewCanvasPointerTransform',
    )
    expect(transformPreviewFile.source).toContain('getCanvasMoveSnap')
    expect(transformPreviewFile.source).toContain('moveCanvasSelection')
    expect(transformPreviewFile.source).toContain('resizeCanvasSelection')
    expect(transformPreviewFile.source).toContain('snapCanvasPointToGrid')
    expect(movementFile.source).toContain(
      'export function hasCanvasInteractionMoved',
    )
    expect(movementFile.source).toContain('DRAG_THRESHOLD')
  })

})

import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas pointer start boundaries', () => {
  it('keeps pointer interaction start rules behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const startSessionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerStartSession.ts',
    )
    const gestureEngineFile = getSourceFile(
      'src/canvas/engine/gesture/CanvasGestureEngine.ts',
    )
    const toolGestureRoutingFile = getSourceFile(
      'src/canvas/engine/gesture/CanvasToolGestureRouting.ts',
    )
    const startFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionStart.ts',
    )
    const resultContractsFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionResultContracts.ts',
    )
    const creationStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationStart.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )
    const shapeCreationDescriptorsFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerShapeCreationDescriptors.ts',
    )
    const textCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerTextCreation.ts',
    )
    const marqueeInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerMarqueeInteraction.ts',
    )
    const panInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerPanInteraction.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasPointerInteractionStart'",
    )
    expect(downHandlersFile.source).not.toContain('getCanvasPointerGesture')
    expect(downHandlersFile.source).not.toContain('isAdditivePointerInput')
    expect(downHandlersFile.source).not.toContain('createCanvasText')
    expect(downHandlersFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(downHandlersFile.source).not.toContain(
      'createCanvasDraftStroke',
    )
    expect(downHandlersFile.source).not.toContain('screenPoint(')
    expect(downHandlersFile.source).not.toContain('screenToWorld(')
    expect(downHandlersFile.source).toContain(
      "from './CanvasPointerStartSession'",
    )
    expect(startSessionFile.source).toContain(
      'export function getCanvasPointerStartProjection',
    )
    expect(startSessionFile.source).not.toContain('Pick<')
    expect(startSessionFile.source).toContain('CanvasAppScreenPointInput')
    expect(startSessionFile.source).toContain('screenPoint(')
    expect(startSessionFile.source).toContain('screenToWorld(')
    expect(startFile.source).toContain(
      'export function startCanvasPointerInteraction',
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerInteractionResultContracts'",
    )
    expect(startFile.source).not.toContain(
      'export type CanvasPointerInteractionStartResult',
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerCreationStart'",
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerMarqueeInteraction'",
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerPanInteraction'",
    )
    expect(startFile.source).toContain('getCanvasPointerGesture')
    expect(startFile.source).not.toContain('isAdditivePointerInput')
    expect(startFile.source).not.toContain('origin: viewport')
    expect(startFile.source).not.toContain('createCanvasText')
    expect(startFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(startFile.source).not.toContain('createCanvasDraftStroke')
    expect(gestureEngineFile.source).toContain(
      "from './CanvasToolGestureRouting'",
    )
    expect(gestureEngineFile.source).not.toContain("tool === 'rect'")
    expect(gestureEngineFile.source).not.toContain("tool === 'marker'")
    expect(gestureEngineFile.source).not.toContain("tool === 'highlight'")
    expect(gestureEngineFile.source).not.toContain("tool === 'arrow'")
    expect(gestureEngineFile.source).not.toContain("tool === 'text'")
    expect(gestureEngineFile.source).not.toContain("tool === 'pan'")
    expect(toolGestureRoutingFile.source).toContain(
      'CANVAS_TOOL_GESTURE_ROUTES',
    )
    expect(toolGestureRoutingFile.source).toContain(
      'type CanvasToolGestureRouteInput',
    )
    expect(toolGestureRoutingFile.source).not.toContain('Omit<')
    expect(toolGestureRoutingFile.source).toContain("gesture: 'draw-marker'")
    expect(toolGestureRoutingFile.source).toContain(
      "gesture: 'draw-highlight'",
    )
    expect(toolGestureRoutingFile.source).toContain(
      'routeItemPointerToCanvasGesture',
    )
    expect(creationStartFile.source).toContain(
      'export function startCanvasPointerCreation',
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerInteractionResultContracts'",
    )
    expect(creationStartFile.source).not.toContain(
      'export type CanvasPointerCreationStartResult',
    )
    expect(resultContractsFile.source).toContain(
      'export type CanvasPointerInteractionStartResult',
    )
    expect(resultContractsFile.source).toContain(
      'export type CanvasPointerCreationStartResult',
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerDrawingCreation'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerCustomCreation'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerShapeCreation'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerTextCreation'",
    )
    expect(creationStartFile.source).not.toContain('createCanvasText')
    expect(creationStartFile.source).not.toContain('createCanvasDraftStroke')
    expect(drawingCreationFile.source).toContain('createCanvasDraftStroke')
    expect(creationStartFile.source).not.toContain('normalizeBounds')
    expect(creationStartFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(customCreationFile.source).toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(shapeCreationDescriptorsFile.source).toContain('normalizeBounds')
    expect(textCreationFile.source).toContain('createCanvasText')
    expect(marqueeInteractionFile.source).toContain(
      'export function startCanvasPointerMarqueeInteraction',
    )
    expect(marqueeInteractionFile.source).toContain('isAdditivePointerInput')
    expect(panInteractionFile.source).toContain(
      'export function startCanvasPointerPanInteraction',
    )
    expect(panInteractionFile.source).toContain('origin: viewport')
  })


  it('keeps item pointer interaction start rules behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const itemStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasItemPointerInteractionStart.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasItemPointerInteractionStart'",
    )
    expect(downHandlersFile.source).not.toContain(
      'getCanvasItemPointerIntent',
    )
    expect(downHandlersFile.source).not.toContain(
      'getCanvasItemPointerSelection',
    )
    expect(downHandlersFile.source).not.toContain('findEditableTextItem')
    expect(downHandlersFile.source).not.toContain('altDragDuplicate')
    expect(downHandlersFile.source).not.toContain('historySelection')
    expect(downHandlersFile.source).not.toContain('config.gestures.textEdit')
    expect(downHandlersFile.source).not.toContain("item.type === 'rect'")
    expect(downHandlersFile.source).not.toContain('commitSelection([item.id])')
    expect(itemStartFile.source).toContain(
      'export function startCanvasItemPointerInteraction',
    )
    expect(itemStartFile.source).toContain(
      'export function startCanvasTextEditInteraction',
    )
    expect(itemStartFile.source).toContain('getCanvasItemPointerIntent')
    expect(itemStartFile.source).toContain('getCanvasItemPointerSelection')
    expect(itemStartFile.source).toContain('findEditableTextItem')
    expect(itemStartFile.source).toContain('altDragDuplicate')
    expect(itemStartFile.source).toContain('historySelection')
    expect(itemStartFile.source).toContain('config.gestures.textEdit')
    expect(itemStartFile.source).toContain('getCanvasEditableTextValue')
    expect(itemStartFile.source).toContain('selection: [item.id]')
  })


  it('keeps resize pointer interaction start rules behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const resizeStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasResizePointerInteractionStart.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasResizePointerInteractionStart'",
    )
    expect(downHandlersFile.source).not.toContain('config.gestures.resize')
    expect(downHandlersFile.source).not.toContain("kind: 'resize'")
    expect(downHandlersFile.source).not.toContain('currentItems: items')
    expect(downHandlersFile.source).not.toContain('historyItems: items')
    expect(resizeStartFile.source).toContain(
      'export function startCanvasResizePointerInteraction',
    )
    expect(resizeStartFile.source).toContain('config.gestures.resize')
    expect(resizeStartFile.source).toContain("kind: 'resize'")
    expect(resizeStartFile.source).toContain('currentItems: items')
    expect(resizeStartFile.source).toContain('historyItems: items')
  })

})

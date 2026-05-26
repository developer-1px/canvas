import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../../engine'
import type { CanvasSceneAdapter } from '../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  previewCanvasPointerShapeCreation,
  startCanvasPointerShapeCreation,
} from './CanvasPointerShapeCreation'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerShapeCreation start and preview', () => {
  it('starts built-in shapes and arrow creation through one shape descriptor contract', () => {
    const rect = startCanvasPointerShapeCreation({
      config,
      input: createPointerInput(),
      pointerGesture: 'create-shape',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      tool: 'rect',
    })
    const ellipse = startCanvasPointerShapeCreation({
      config,
      input: createPointerInput(),
      pointerGesture: 'create-shape',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      tool: 'ellipse',
    })
    const diamond = startCanvasPointerShapeCreation({
      config,
      input: createPointerInput(),
      pointerGesture: 'create-shape',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      tool: 'diamond',
    })
    const arrow = startCanvasPointerShapeCreation({
      config,
      input: createPointerInput(),
      pointerGesture: 'create-arrow',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      targetItemId: 'component-start',
      tool: 'arrow',
    })

    expect(rect).toMatchObject({
      draftRect: { h: 0, shape: 'rect', w: 0, x: 80, y: 120 },
      gesture: 'create-shape',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-shape',
        shape: 'rect',
        startWorld: { x: 80, y: 120 },
      },
      kind: 'interaction',
    })
    expect(ellipse).toMatchObject({
      draftRect: { h: 0, shape: 'ellipse', w: 0, x: 80, y: 120 },
      gesture: 'create-shape',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-shape',
        shape: 'ellipse',
        startWorld: { x: 80, y: 120 },
      },
      kind: 'interaction',
    })
    expect(diamond).toMatchObject({
      draftRect: { h: 0, shape: 'diamond', w: 0, x: 80, y: 120 },
      gesture: 'create-shape',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-shape',
        shape: 'diamond',
        startWorld: { x: 80, y: 120 },
      },
      kind: 'interaction',
    })
    expect(arrow).toMatchObject({
      draftArrow: {
        end: { x: 80, y: 120 },
        routing: 'elbow',
        start: { x: 80, y: 120 },
      },
      gesture: 'create-arrow',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-arrow',
        startAttachedTo: 'component-start',
      },
      kind: 'interaction',
    })
  })


  it('previews enabled shape creation and contains disabled shape gestures', () => {
    const preview = previewCanvasPointerShapeCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-shape',
        moved: false,
        pointerId: 1,
        shape: 'rect',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createSceneAdapter(),
    })
    const ellipsePreview = previewCanvasPointerShapeCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-shape',
        moved: false,
        pointerId: 1,
        shape: 'ellipse',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createSceneAdapter(),
    })
    const disabled = previewCanvasPointerShapeCreation({
      config: createCanvasAffordanceConfig({
        gestures: { createShape: false },
      }),
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-shape',
        moved: false,
        pointerId: 1,
        shape: 'ellipse',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createSceneAdapter(),
    })

    expect(preview).toMatchObject({
      draftRect: { h: 80, shape: 'rect', w: 80, x: 0, y: 0 },
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-shape',
        moved: true,
      },
      kind: 'preview',
    })
    expect(ellipsePreview).toMatchObject({
      draftRect: { h: 80, shape: 'ellipse', w: 80, x: 0, y: 0 },
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-shape',
        moved: true,
      },
      kind: 'preview',
    })
    expect(disabled).toEqual({ kind: 'none' })
  })

})

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}

function createSceneAdapter(): CanvasSceneAdapter {
  return {
    entries: [
      {
        bounds: { h: 80, w: 120, x: 0, y: 0 },
        id: 'component-start',
        isGroup: false,
        parentId: null,
        path: [0],
      },
      {
        bounds: { h: 80, w: 120, x: 160, y: 80 },
        id: 'component-end',
        isGroup: false,
        parentId: null,
        path: [1],
      },
    ],
    getBounds: vi.fn(() => null),
    getParentId: vi.fn(() => null),
    getSelectedAncestorId: vi.fn(() => null),
    isGroup: vi.fn(() => false),
  }
}

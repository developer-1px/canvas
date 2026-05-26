import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import type { CanvasSceneAdapter } from '../../engine'
import { previewCanvasPointerShapeCreation } from './CanvasPointerShapeCreation'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerShapeCreation arrow previews', () => {
  it('previews attached arrows from the source edge to the hovered target edge', () => {
    const preview = previewCanvasPointerShapeCreation({
      config,
      currentScreen: { x: 190, y: 100 },
      currentWorld: { x: 190, y: 100 },
      interaction: {
        currentWorld: { x: 10, y: 20 },
        kind: 'create-arrow',
        moved: false,
        pointerId: 1,
        startAttachedTo: 'component-start',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
      },
      scene: createSceneAdapter(),
    })

    expect(preview).toMatchObject({
      draftArrow: {
        end: { x: 160, y: 90 },
        routing: 'elbow',
        start: { x: 120, y: 70 },
      },
      interaction: {
        currentWorld: { x: 160, y: 90 },
        endAttachedTo: 'component-end',
        startWorld: { x: 120, y: 70 },
      },
      kind: 'preview',
    })
  })


  it('anchors only the source endpoint while drawing toward empty canvas', () => {
    const preview = previewCanvasPointerShapeCreation({
      config,
      currentScreen: { x: 300, y: 40 },
      currentWorld: { x: 300, y: 40 },
      interaction: {
        currentWorld: { x: 10, y: 20 },
        kind: 'create-arrow',
        moved: false,
        pointerId: 1,
        startAttachedTo: 'component-start',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
      },
      scene: createSceneAdapter(),
    })

    expect(preview).toMatchObject({
      draftArrow: {
        end: { x: 320, y: 40 },
        routing: 'elbow',
        start: { x: 120, y: 40 },
      },
      interaction: {
        currentWorld: { x: 320, y: 40 },
        endAttachedTo: undefined,
        startWorld: { x: 120, y: 40 },
      },
      kind: 'preview',
    })
  })
})

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

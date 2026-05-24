import { describe, expect, it } from 'vitest'
import type { CanvasPointerGesture } from '../../engine'
import { getCanvasDrawingStrokeStyle } from '../../host'
import type { Interaction } from './CanvasInteractionState'
import {
  isCanvasPointerCreationGesture,
  isCanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'

describe('CanvasPointerCreationGrammar', () => {
  it('recognizes pointer gestures that belong to creation', () => {
    const creationGestures: CanvasPointerGesture[] = [
      'create-arrow',
      'create-comment',
      'create-custom',
      'create-rect',
      'create-section',
      'create-sticky',
      'create-text',
      'draw-highlight',
      'draw-marker',
    ]
    const nonCreationGestures: CanvasPointerGesture[] = [
      'marquee',
      'none',
      'pan',
    ]

    expect(creationGestures.every(isCanvasPointerCreationGesture)).toBe(true)
    expect(nonCreationGestures.some(isCanvasPointerCreationGesture)).toBe(false)
  })

  it('recognizes active drag interactions that belong to creation', () => {
    const creationInteractions: Interaction[] = [
      {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-rect',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      {
        currentWorld: { x: 0, y: 0 },
        kind: 'draw-marker',
        moved: false,
        pointerId: 1,
        points: [{ x: 0, y: 0 }],
        style: getCanvasDrawingStrokeStyle('marker'),
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-section',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-custom',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        tool: 'custom:risk',
      },
    ]
    const nonCreationInteractions: Interaction[] = [
      { kind: 'none' },
      {
        kind: 'pan',
        origin: { scale: 1, x: 0, y: 0 },
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
      },
      {
        additive: false,
        baseSelection: [],
        currentWorld: { x: 0, y: 0 },
        kind: 'marquee',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    ]

    expect(creationInteractions.every(isCanvasPointerCreationInteraction))
      .toBe(true)
    expect(nonCreationInteractions.some(isCanvasPointerCreationInteraction))
      .toBe(false)
  })
})

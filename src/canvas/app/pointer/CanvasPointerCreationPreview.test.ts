import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasSceneAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { previewCanvasPointerCreation } from './CanvasPointerCreationPreview'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerCreationPreview', () => {
  it('previews created rects with snapped draft bounds', () => {
    const result = previewCanvasPointerCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      input: createPointerInput(),
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-rect',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createSceneAdapter(),
    })

    expect(result).toMatchObject({
      draftRect: { h: 80, w: 80, x: 0, y: 0 },
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-rect',
        moved: true,
      },
      kind: 'preview',
    })
  })

  it('previews drawing strokes and shift start/end points', () => {
    const result = previewCanvasPointerCreation({
      config,
      currentScreen: { x: 40, y: 20 },
      currentWorld: { x: 40, y: 20 },
      input: createPointerInput({ shiftKey: true }),
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'draw-highlight',
        moved: false,
        pointerId: 1,
        points: [{ x: 0, y: 0 }],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createSceneAdapter(),
    })

    expect(result).toMatchObject({
      draftStroke: {
        kind: 'highlight',
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      interaction: {
        kind: 'draw-highlight',
        moved: true,
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      kind: 'preview',
    })
  })

  it('previews arrows and custom creation current world without item commits', () => {
    const arrow = previewCanvasPointerCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      input: createPointerInput(),
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-arrow',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createSceneAdapter(),
    })
    const custom = previewCanvasPointerCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      input: createPointerInput(),
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-custom',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        tool: 'custom:risk',
      },
      scene: createSceneAdapter(),
    })

    expect(arrow).toMatchObject({
      draftArrow: {
        end: { x: 80, y: 80 },
        start: { x: 0, y: 0 },
      },
      kind: 'preview',
    })
    expect(custom).toMatchObject({
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-custom',
        moved: true,
      },
      kind: 'preview',
    })
  })

  it('does not preview disabled creation gestures', () => {
    expect(
      previewCanvasPointerCreation({
        config: createCanvasAffordanceConfig({
          gestures: { createRect: false },
        }),
        currentScreen: { x: 90, y: 90 },
        currentWorld: { x: 90, y: 90 },
        input: createPointerInput(),
        interaction: {
          currentWorld: { x: 0, y: 0 },
          kind: 'create-rect',
          moved: false,
          pointerId: 1,
          startScreen: { x: 0, y: 0 },
          startWorld: { x: 0, y: 0 },
        },
        scene: createSceneAdapter(),
      }),
    ).toEqual({ kind: 'none' })
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
    entries: [],
    getBounds: vi.fn(() => null),
    getParentId: vi.fn(() => null),
    getSelectedAncestorId: vi.fn(() => null),
    isGroup: vi.fn(() => false),
  }
}

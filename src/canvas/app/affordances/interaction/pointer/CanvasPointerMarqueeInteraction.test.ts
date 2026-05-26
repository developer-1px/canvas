import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  createCanvasSceneAdapter,
} from '../../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  cancelCanvasPointerMarqueeInteraction,
  commitCanvasPointerMarqueeInteraction,
  previewCanvasPointerMarqueeInteraction,
  startCanvasPointerMarqueeInteraction,
  type CanvasPointerMarqueeInteraction,
} from './CanvasPointerMarqueeInteraction'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerMarqueeInteraction', () => {
  it('starts marquee interactions with additive selection ownership', () => {
    const input = createPointerInput({ shiftKey: true })

    expect(
      startCanvasPointerMarqueeInteraction({
        input,
        selection: ['rect-1'],
        startScreen: { x: 10, y: 20 },
        startWorld: { x: 100, y: 200 },
      }),
    ).toEqual({
      capturePointer: true,
      clearSelection: false,
      gesture: 'marquee',
      interaction: {
        additive: true,
        baseSelection: ['rect-1'],
        currentWorld: { x: 100, y: 200 },
        kind: 'marquee',
        moved: false,
        pointerId: 1,
        startScreen: { x: 10, y: 20 },
        startWorld: { x: 100, y: 200 },
      },
    })
  })

  it('previews marquee selection through the scene adapter after movement', () => {
    const result = previewCanvasPointerMarqueeInteraction({
      config,
      currentScreen: { x: 80, y: 80 },
      currentWorld: { x: 80, y: 80 },
      interaction: createInteraction({
        additive: true,
        baseSelection: ['existing'],
      }),
      scene: createCanvasSceneAdapter([
        {
          bounds: { h: 40, w: 40, x: 20, y: 20 },
          id: 'rect-1',
          isGroup: false,
          parentId: null,
          path: [0],
        },
      ]),
    })

    expect(result).toMatchObject({
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'marquee',
        moved: true,
      },
      kind: 'preview',
      marquee: { h: 80, w: 80, x: 0, y: 0 },
      selection: ['existing', 'rect-1'],
    })
  })

  it('keeps preview quiet before movement or when marquee is disabled', () => {
    const interaction = createInteraction()

    expect(
      previewCanvasPointerMarqueeInteraction({
        config,
        currentScreen: { x: 1, y: 1 },
        currentWorld: { x: 1, y: 1 },
        interaction,
        scene: createCanvasSceneAdapter([]),
      }),
    ).toEqual({
      interaction: {
        ...interaction,
        currentWorld: { x: 1, y: 1 },
        moved: false,
      },
      kind: 'preview',
      snapGuides: {
        alignmentGuides: [],
        spacingGuides: [],
      },
    })

    expect(
      previewCanvasPointerMarqueeInteraction({
        config: createCanvasAffordanceConfig({
          gestures: { marquee: false },
        }),
        currentScreen: { x: 80, y: 80 },
        currentWorld: { x: 80, y: 80 },
        interaction,
        scene: createCanvasSceneAdapter([]),
      }),
    ).toEqual({ kind: 'none' })
  })

  it('commits moved marquee selection and restores the base live selection', () => {
    const commitSelection = vi.fn(() => true)
    const setSelection = vi.fn()

    commitCanvasPointerMarqueeInteraction({
      commitSelection,
      interaction: createInteraction({
        additive: true,
        baseSelection: ['existing'],
        currentWorld: { x: 80, y: 80 },
        moved: true,
      }),
      scene: createCanvasSceneAdapter([
        {
          bounds: { h: 40, w: 40, x: 20, y: 20 },
          id: 'rect-1',
          isGroup: false,
          parentId: null,
          path: [0],
        },
      ]),
      setSelection,
    })

    expect(setSelection).toHaveBeenCalledWith(['existing'])
    expect(commitSelection).toHaveBeenCalledWith(['existing', 'rect-1'])
  })

  it('commits a non-additive click as selection clear', () => {
    const commitSelection = vi.fn(() => true)
    const setSelection = vi.fn()

    commitCanvasPointerMarqueeInteraction({
      commitSelection,
      interaction: createInteraction({
        additive: false,
        baseSelection: ['existing'],
        moved: false,
      }),
      scene: createCanvasSceneAdapter([]),
      setSelection,
    })

    expect(setSelection).toHaveBeenCalledWith(['existing'])
    expect(commitSelection).toHaveBeenCalledWith([])
  })

  it('restores the base live selection on cancel', () => {
    const setSelection = vi.fn()

    cancelCanvasPointerMarqueeInteraction({
      interaction: createInteraction({
        baseSelection: ['existing'],
      }),
      setSelection,
    })

    expect(setSelection).toHaveBeenCalledWith(['existing'])
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

function createInteraction(
  overrides: Partial<CanvasPointerMarqueeInteraction> = {},
): CanvasPointerMarqueeInteraction {
  return {
    additive: false,
    baseSelection: [],
    currentWorld: { x: 0, y: 0 },
    kind: 'marquee',
    moved: false,
    pointerId: 1,
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    ...overrides,
  }
}

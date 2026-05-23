import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasItem,
  Viewport,
} from '../../entities'
import { EMPTY_CANVAS_SNAP_GUIDES } from '../../engine'
import {
  applyCanvasPointerInteractionCancelEffect,
  applyCanvasPointerInteractionEndEffect,
  applyCanvasPointerInteractionPreviewEffect,
  type CanvasPointerInteractionDragEffectContext,
} from './CanvasPointerInteractionDragEffects'

describe('CanvasPointerInteractionDragEffects', () => {
  it('applies preview descriptors to drag state', () => {
    const context = createContext()
    const interaction = moveInteraction({
      currentItems: [rect('rect-2')],
    })
    const viewport: Viewport = { scale: 2, x: 10, y: 20 }

    const applied = applyCanvasPointerInteractionPreviewEffect({
      context,
      preview: {
        draftArrow: {
          end: { x: 12, y: 16 },
          start: { x: 4, y: 8 },
        },
        draftRect: { h: 30, w: 40, x: 1, y: 2 },
        draftStroke: {
          kind: 'marker',
          opacity: 1,
          points: [{ x: 1, y: 2 }],
          stroke: '#111827',
          strokeWidth: 2,
        },
        interaction,
        kind: 'preview',
        liveItems: [rect('rect-2')],
        marquee: { h: 20, w: 20, x: 0, y: 0 },
        selection: ['rect-2'],
        snapGuides: {
          alignmentGuides: [
            {
              end: 10,
              orientation: 'horizontal',
              position: 5,
              start: 0,
            },
          ],
          spacingGuides: [
            {
              gap: 8,
              orientation: 'vertical',
              segments: [
                {
                  end: { x: 10, y: 10 },
                  start: { x: 0, y: 0 },
                },
              ],
            },
          ],
        },
        viewport,
      },
    })

    expect(applied).toBe(true)
    expect(context.interactionRef.current).toBe(interaction)
    expect(context.setLiveItems).toHaveBeenCalledWith([rect('rect-2')])
    expect(context.setMarquee).toHaveBeenCalledWith({
      h: 20,
      w: 20,
      x: 0,
      y: 0,
    })
    expect(context.setSelection).toHaveBeenCalledWith(['rect-2'])
    expect(context.setViewport).toHaveBeenCalledWith(viewport)
    expect(context.setSnapGuides).toHaveBeenCalledWith({
      alignmentGuides: [
        {
          end: 10,
          orientation: 'horizontal',
          position: 5,
          start: 0,
        },
      ],
      spacingGuides: [
        {
          gap: 8,
          orientation: 'vertical',
          segments: [
            {
              end: { x: 10, y: 10 },
              start: { x: 0, y: 0 },
            },
          ],
        },
      ],
    })
    expect(context.setDraftRect).toHaveBeenCalledWith({
      h: 30,
      w: 40,
      x: 1,
      y: 2,
    })
    expect(context.setDraftStroke).toHaveBeenCalled()
    expect(context.setDraftArrow).toHaveBeenCalled()
  })

  it('ignores none preview descriptors', () => {
    const context = createContext()

    const applied = applyCanvasPointerInteractionPreviewEffect({
      context,
      preview: { kind: 'none' },
    })

    expect(applied).toBe(false)
    expect(context.setSnapGuides).not.toHaveBeenCalled()
    expect(context.interactionRef.current).toEqual({ kind: 'none' })
  })

  it('releases pointer and clears drag overlays after commit', () => {
    const context = createContext({
      interactionRef: {
        current: moveInteraction(),
      },
    })

    applyCanvasPointerInteractionEndEffect({
      context,
      event: { pointerId: 9 },
    })

    expect(context.stageElement.releasePointer).toHaveBeenCalledWith(9)
    expect(context.interactionRef.current).toEqual({ kind: 'none' })
    expect(context.setGesture).toHaveBeenCalledWith('none')
    expect(context.setMarquee).toHaveBeenCalledWith(null)
    expect(context.setDraftArrow).toHaveBeenCalledWith(null)
    expect(context.setDraftRect).toHaveBeenCalledWith(null)
    expect(context.setDraftStroke).toHaveBeenCalledWith(null)
    expect(context.setSnapGuides).toHaveBeenCalledWith(
      EMPTY_CANVAS_SNAP_GUIDES,
    )
  })

  it('rolls back cancel effects before clearing drag state', () => {
    const historyItems = [rect('rect-1')]
    const context = createContext({
      interactionRef: {
        current: moveInteraction({ historyItems }),
      },
    })

    applyCanvasPointerInteractionCancelEffect({
      context,
      event: { pointerId: 9 },
      interaction: context.interactionRef.current,
    })

    expect(context.setLiveItems).toHaveBeenCalledWith(historyItems)
    expect(context.stageElement.releasePointer).toHaveBeenCalledWith(9)
    expect(context.interactionRef.current).toEqual({ kind: 'none' })
    expect(context.setSnapGuides).toHaveBeenCalledWith(
      EMPTY_CANVAS_SNAP_GUIDES,
    )
  })
})

function createContext(
  overrides: Partial<CanvasPointerInteractionDragEffectContext> = {},
): CanvasPointerInteractionDragEffectContext {
  return {
    interactionRef: { current: { kind: 'none' } },
    setDraftArrow: vi.fn(),
    setDraftRect: vi.fn(),
    setDraftStroke: vi.fn(),
    setGesture: vi.fn(),
    setLiveItems: vi.fn(),
    setMarquee: vi.fn(),
    setSelection: vi.fn(),
    setSnapGuides: vi.fn(),
    setViewport: vi.fn(),
    stageElement: {
      addWheelListener: vi.fn(),
      capturePointer: vi.fn(),
      getRect: vi.fn(() => null),
      getScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
      getViewportCenter: vi.fn(() => null),
      releasePointer: vi.fn(),
    },
    ...overrides,
  }
}

function moveInteraction(
  overrides: Partial<Extract<
    CanvasPointerInteractionDragEffectContext['interactionRef']['current'],
    { kind: 'move' }
  >> = {},
): Extract<
  CanvasPointerInteractionDragEffectContext['interactionRef']['current'],
  { kind: 'move' }
> {
  return {
    bounds: { h: 40, w: 40, x: 0, y: 0 },
    currentItems: [rect('rect-1')],
    historyItems: [rect('rect-1')],
    historySelection: ['rect-1'],
    ids: ['rect-1'],
    kind: 'move',
    moved: true,
    pointerId: 9,
    startItems: [rect('rect-1')],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    ...overrides,
  }
}

function rect(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}

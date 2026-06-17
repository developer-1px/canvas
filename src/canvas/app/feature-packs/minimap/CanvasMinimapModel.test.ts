import { describe, expect, it } from 'vitest'
import {
  CANVAS_MINIMAP_READ_MODEL,
  getCanvasMinimapPointFromViewportOffset,
  getCanvasMinimapReadModel,
  getCanvasMinimapViewportForWorldCenter,
  getCanvasMinimapWorldPoint,
} from './CanvasMinimapModel'

describe('CanvasMinimapModel', () => {
  const stageRect = {
    height: 600,
    left: 0,
    top: 0,
    width: 900,
  }

  it('exposes a stable read model metadata value', () => {
    expect(CANVAS_MINIMAP_READ_MODEL).toBe('canvas-minimap-read-model')
  })

  it('projects item bounds and the current viewport into minimap coordinates', () => {
    const model = getCanvasMinimapReadModel({
      items: [
        { bounds: { h: 120, w: 200, x: 100, y: 80 }, id: 'card' },
        { bounds: { h: 90, w: 160, x: 520, y: 340 }, id: 'note' },
      ],
      stageRect,
      viewport: { scale: 2, x: -200, y: -100 },
    })

    expect(model.isEmpty).toBe(false)
    expect(model.contentBounds).toEqual({ h: 350, w: 580, x: 100, y: 80 })
    expect(model.viewportWorldBounds).toEqual({
      h: 300,
      w: 450,
      x: 100,
      y: 50,
    })
    expect(model.itemRects).toHaveLength(2)
    expect(model.scale).toBe(
      Math.min(
        model.displayBounds.w / model.worldBounds.w,
        model.displayBounds.h / model.worldBounds.h,
      ),
    )
    expect(model.viewportRect.w).toBeGreaterThan(0)
    expect(model.viewportRect.h).toBeGreaterThan(0)
  })

  it('updates the viewport rect when pan or zoom changes', () => {
    const items = [
      { bounds: { h: 120, w: 200, x: 100, y: 80 }, id: 'card' },
      { bounds: { h: 120, w: 200, x: 1600, y: 920 }, id: 'remote' },
    ]
    const base = getCanvasMinimapReadModel({
      items,
      stageRect,
      viewport: { scale: 1, x: 0, y: 0 },
    })
    const changed = getCanvasMinimapReadModel({
      items,
      stageRect,
      viewport: { scale: 2, x: -200, y: -100 },
    })

    expect(changed.viewportRect).not.toEqual(base.viewportRect)
  })

  it('maps a minimap click to a viewport center without changing zoom', () => {
    const model = getCanvasMinimapReadModel({
      items: [{ bounds: { h: 120, w: 200, x: 100, y: 80 }, id: 'card' }],
      stageRect,
      viewport: { scale: 2, x: -200, y: -100 },
    })
    const worldPoint = getCanvasMinimapWorldPoint({
      model,
      point: {
        x: model.viewportRect.x + model.viewportRect.w / 2,
        y: model.viewportRect.y + model.viewportRect.h / 2,
      },
    })

    expect(
      getCanvasMinimapViewportForWorldCenter({
        current: { scale: 2, x: -200, y: -100 },
        stageRect,
        worldCenter: worldPoint,
      }),
    ).toEqual({ scale: 2, x: -200, y: -100 })
  })

  it('normalizes pointer offsets into minimap viewBox coordinates', () => {
    const model = getCanvasMinimapReadModel({
      items: [{ bounds: { h: 120, w: 200, x: 100, y: 80 }, id: 'card' }],
      stageRect,
      viewport: { scale: 1, x: 0, y: 0 },
    })

    expect(getCanvasMinimapPointFromViewportOffset({
      model,
      offset: { x: 94, y: 62 },
      viewportSize: { h: 124, w: 188 },
    })).toEqual({
      x: 88,
      y: 56,
    })
    expect(getCanvasMinimapPointFromViewportOffset({
      model,
      offset: { x: 94, y: 62 },
      viewportSize: { h: 0, w: 188 },
    })).toBeNull()
  })

  it('keeps empty and tiny documents renderable', () => {
    const empty = getCanvasMinimapReadModel({
      items: [],
      stageRect,
      viewport: { scale: 1, x: 0, y: 0 },
    })
    const tiny = getCanvasMinimapReadModel({
      items: [{ bounds: { h: 0, w: 0, x: 24, y: 32 }, id: 'dot' }],
      stageRect: {
        height: 1,
        left: 0,
        top: 0,
        width: 1,
      },
      viewport: { scale: 1, x: -24, y: -32 },
    })

    expect(empty.isEmpty).toBe(true)
    expect(empty.itemRects).toEqual([])
    expect(empty.viewportRect.w).toBeGreaterThan(0)
    expect(tiny.itemRects[0]?.rect.w).toBeGreaterThanOrEqual(1)
    expect(tiny.itemRects[0]?.rect.h).toBeGreaterThanOrEqual(1)
  })
})

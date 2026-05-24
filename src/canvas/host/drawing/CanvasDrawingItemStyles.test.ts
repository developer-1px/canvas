import { describe, expect, it } from 'vitest'
import {
  CANVAS_ARROW_STYLE,
  CANVAS_DRAWING_STROKE_STYLE_DEFAULTS,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
  createCanvasDrawingStrokeStyleSet,
  getCanvasArrowStyle,
  getCanvasDrawingStrokeStyle,
} from './CanvasDrawingItemStyles'

describe('CanvasDrawingItemStyles', () => {
  it('owns built-in drawing item style defaults', () => {
    expect(getCanvasDrawingStrokeStyle('marker')).toBe(CANVAS_MARKER_STYLE)
    expect(getCanvasDrawingStrokeStyle('highlight')).toBe(CANVAS_HIGHLIGHT_STYLE)
    expect(CANVAS_DRAWING_STROKE_STYLE_DEFAULTS.marker).toBe(CANVAS_MARKER_STYLE)
    expect(getCanvasArrowStyle()).toBe(CANVAS_ARROW_STYLE)
  })

  it('keeps style defaults immutable after export', () => {
    expect(Object.isFrozen(CANVAS_MARKER_STYLE)).toBe(true)
    expect(Object.isFrozen(CANVAS_HIGHLIGHT_STYLE)).toBe(true)
    expect(Object.isFrozen(CANVAS_DRAWING_STROKE_STYLE_DEFAULTS)).toBe(true)
    expect(Object.isFrozen(CANVAS_ARROW_STYLE)).toBe(true)
  })

  it('creates immutable drawing style sets with caller overrides', () => {
    const styles = createCanvasDrawingStrokeStyleSet({
      marker: {
        stroke: '#111827',
        strokeWidth: 8,
      },
    })

    expect(styles.marker).toEqual({
      ...CANVAS_MARKER_STYLE,
      stroke: '#111827',
      strokeWidth: 8,
    })
    expect(styles.highlight).toEqual(CANVAS_HIGHLIGHT_STYLE)
    expect(Object.isFrozen(styles)).toBe(true)
    expect(Object.isFrozen(styles.marker)).toBe(true)
  })
})

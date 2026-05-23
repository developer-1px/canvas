import { describe, expect, it } from 'vitest'
import {
  CANVAS_ARROW_STYLE,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
  getCanvasArrowStyle,
  getCanvasDrawingStrokeStyle,
} from './CanvasDrawingItemStyles'

describe('CanvasDrawingItemStyles', () => {
  it('owns built-in drawing item style defaults', () => {
    expect(getCanvasDrawingStrokeStyle('marker')).toBe(CANVAS_MARKER_STYLE)
    expect(getCanvasDrawingStrokeStyle('highlight')).toBe(CANVAS_HIGHLIGHT_STYLE)
    expect(getCanvasArrowStyle()).toBe(CANVAS_ARROW_STYLE)
  })

  it('keeps style defaults immutable after export', () => {
    expect(Object.isFrozen(CANVAS_MARKER_STYLE)).toBe(true)
    expect(Object.isFrozen(CANVAS_HIGHLIGHT_STYLE)).toBe(true)
    expect(Object.isFrozen(CANVAS_ARROW_STYLE)).toBe(true)
  })
})

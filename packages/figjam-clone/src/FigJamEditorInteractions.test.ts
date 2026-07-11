import { describe, expect, it } from 'vitest'
import {
  createFigJamDrawingNode,
  createFigJamShapeNode,
} from '@interactive-os/figjam-pack'

import {
  createFigJamMarqueeBounds,
  isFigJamErasableDrawing,
  localizeFigJamDrawing,
  updateFigJamSelection,
} from './FigJamEditorInteractions'

describe('FigJam editor interactions', () => {
  it('replaces or toggles exact React design-node selection', () => {
    expect(updateFigJamSelection({
      additive: false,
      current: ['sticky-a', 'sticky-b'],
      nodeId: 'shape-a',
    })).toEqual(['shape-a'])
    expect(updateFigJamSelection({
      additive: true,
      current: ['sticky-a'],
      nodeId: 'shape-a',
    })).toEqual(['sticky-a', 'shape-a'])
    expect(updateFigJamSelection({
      additive: true,
      current: ['sticky-a', 'shape-a'],
      nodeId: 'sticky-a',
    })).toEqual(['shape-a'])
  })

  it('normalizes reverse marquee and drawing gestures into world geometry', () => {
    expect(createFigJamMarqueeBounds(
      { x: 40, y: 80 },
      { x: 10, y: 20 },
    )).toEqual({ h: 60, w: 30, x: 10, y: 20 })

    expect(localizeFigJamDrawing([
      { x: 120, y: 90 },
      { x: 150, y: 70 },
      { x: 180, y: 100 },
    ])).toEqual({
      h: 30,
      w: 60,
      x: 120,
      y: 70,
      points: [
        { x: 0, y: 20 },
        { x: 30, y: 0 },
        { x: 60, y: 30 },
      ],
    })
  })

  it('limits the eraser to marker and highlighter stroke drawings', () => {
    const input = {
      geometry: {
        kind: 'points' as const,
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      height: 20,
      nodeId: 'drawing',
      width: 40,
      x: 0,
      y: 0,
    }

    expect(isFigJamErasableDrawing(createFigJamDrawingNode({
      ...input,
      variant: 'marker',
    }))).toBe(true)
    expect(isFigJamErasableDrawing(createFigJamDrawingNode({
      ...input,
      variant: 'highlight',
    }))).toBe(true)
    expect(isFigJamErasableDrawing(createFigJamDrawingNode({
      ...input,
      geometry: {
        kind: 'path',
        segments: [
          { type: 'move', point: { x: 0, y: 0 } },
          { type: 'line', point: { x: 40, y: 20 } },
        ],
      },
      variant: 'path',
    }))).toBe(false)
    expect(isFigJamErasableDrawing(createFigJamShapeNode({
      nodeId: 'shape',
      x: 0,
      y: 0,
    }))).toBe(false)
  })
})

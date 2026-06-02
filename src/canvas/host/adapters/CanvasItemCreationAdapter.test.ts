import { describe, expect, it } from 'vitest'
import {
  CANVAS_ARROW_STYLE,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
  CANVAS_PATH_STYLE,
} from '../drawing/CanvasDrawingItemStyles'
import { CANVAS_ITEM_CREATION_ADAPTER } from './CanvasItemCreationAdapter'

describe('CanvasItemCreationAdapter', () => {
  it('creates drawing items from shared drawing style defaults', () => {
    expect(CANVAS_ITEM_CREATION_ADAPTER.createMarker({
      id: 'marker-1',
      points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
    })).toMatchObject({
      ...CANVAS_MARKER_STYLE,
      type: 'marker',
    })
    expect(CANVAS_ITEM_CREATION_ADAPTER.createHighlight({
      id: 'highlight-1',
      points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
    })).toMatchObject({
      ...CANVAS_HIGHLIGHT_STYLE,
      type: 'highlight',
    })
    expect(CANVAS_ITEM_CREATION_ADAPTER.createMarker({
      id: 'marker-custom',
      points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
      style: {
        opacity: 0.7,
        stroke: '#111827',
        strokeWidth: 8,
      },
    })).toMatchObject({
      opacity: 0.7,
      stroke: '#111827',
      strokeWidth: 8,
      type: 'marker',
    })
    expect(CANVAS_ITEM_CREATION_ADAPTER.createArrow({
      end: { x: 30, y: 40 },
      endAttachedTo: 'component-2',
      id: 'arrow-1',
      routing: 'elbow',
      start: { x: 10, y: 20 },
      startAttachedTo: 'component-1',
    })).toMatchObject({
      ...CANVAS_ARROW_STYLE,
      endAttachedTo: 'component-2',
      routing: 'elbow',
      startAttachedTo: 'component-1',
      type: 'arrow',
    })
    expect(CANVAS_ITEM_CREATION_ADAPTER.createPath?.({
      id: 'path-1',
      segments: [
        { point: { x: 10, y: 20 }, type: 'move' },
        {
          control1: { x: 20, y: 10 },
          control2: { x: 40, y: 50 },
          point: { x: 60, y: 30 },
          type: 'cubic',
        },
      ],
    })).toMatchObject({
      ...CANVAS_PATH_STYLE,
      fill: 'none',
      h: 43,
      type: 'path',
      w: 53,
      x: 8.5,
      y: 8.5,
    })
  })
})

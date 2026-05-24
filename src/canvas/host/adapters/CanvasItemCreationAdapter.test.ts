import { describe, expect, it } from 'vitest'
import {
  CANVAS_ARROW_STYLE,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
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
  })
})

import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  createCanvasAffordanceConfig,
  type CanvasCreationAdapter,
} from '../../engine'
import {
  startCanvasPointerTextCreation,
} from './CanvasPointerTextCreation'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerTextCreation', () => {
  it('creates text immediately without starting pointer capture', () => {
    const result = startCanvasPointerTextCreation({
      config,
      creationAdapter,
      createId: () => 'text-1',
      pointerGesture: 'create-text',
      startWorld: { x: 80, y: 120 },
    })

    expect(result).toEqual({
      capturePointer: false,
      edit: { id: 'text-1', value: 'Text' },
      item: {
        h: 40,
        id: 'text-1',
        text: 'Text',
        type: 'text',
        w: 120,
        x: 80,
        y: 120,
      },
      kind: 'created-text',
    })
  })

  it('contains disabled text creation and ignores non-text gestures', () => {
    const disabled = startCanvasPointerTextCreation({
      config: createCanvasAffordanceConfig({
        gestures: { createText: false },
      }),
      creationAdapter,
      createId: () => 'text-1',
      pointerGesture: 'create-text',
      startWorld: { x: 80, y: 120 },
    })
    const ignored = startCanvasPointerTextCreation({
      config,
      creationAdapter,
      createId: () => 'rect-1',
      pointerGesture: 'create-rect',
      startWorld: { x: 80, y: 120 },
    })

    expect(disabled).toEqual({ kind: 'none' })
    expect(ignored).toBeNull()
  })
})

const creationAdapter: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, id, start }) => ({
    end,
    h: Math.abs(end.y - start.y),
    id,
    opacity: 1,
    start,
    stroke: '#111827',
    strokeWidth: 2,
    type: 'arrow',
    w: Math.abs(end.x - start.x),
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
  }),
  createHighlight: ({ id, points }) => ({
    h: 0,
    id,
    opacity: 0.4,
    points,
    stroke: '#fde047',
    strokeWidth: 10,
    type: 'highlight',
    w: 0,
    x: 0,
    y: 0,
  }),
  createMarker: ({ id, points }) => ({
    h: 0,
    id,
    opacity: 1,
    points,
    stroke: '#475569',
    strokeWidth: 3,
    type: 'marker',
    w: 0,
    x: 0,
    y: 0,
  }),
  createRect: ({ bounds, id }) => ({
    fill: '#ffffff',
    id,
    stroke: '#111827',
    type: 'rect',
    ...bounds,
  }),
  createText: ({ id, point }) => ({
    editValue: 'Text',
    item: {
      h: 40,
      id,
      text: 'Text',
      type: 'text',
      w: 120,
      x: point.x,
      y: point.y,
    },
  }),
}

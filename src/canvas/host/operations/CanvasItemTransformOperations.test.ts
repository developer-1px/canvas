import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  resizeCanvasItems,
  translateCanvasItems,
} from './CanvasItemTransformOperations'

const arrow: CanvasItem = {
  id: 'arrow-1',
  type: 'arrow',
  x: 88,
  y: 88,
  w: 124,
  h: 44,
  start: { x: 100, y: 100 },
  end: { x: 200, y: 120 },
  stroke: '#334155',
  strokeWidth: 3,
}

const marker: CanvasItem = {
  id: 'marker-1',
  type: 'marker',
  x: 98,
  y: 98,
  w: 104,
  h: 24,
  points: [{ x: 100, y: 100 }, { x: 200, y: 120 }],
  stroke: '#475569',
  strokeWidth: 4,
  opacity: 1,
}

const rect: CanvasItem = {
  fill: '#ffffff',
  h: 80,
  id: 'rect-1',
  stroke: '#111827',
  type: 'rect',
  w: 120,
  x: 10,
  y: 20,
}

const attachedStamp: CanvasItem = {
  attachedTo: 'rect-1',
  h: 44,
  id: 'stamp-1',
  label: '+1',
  stamp: 'thumbs-up',
  type: 'stamp',
  w: 44,
  x: 108,
  y: -2,
}

const attachedComment: CanvasItem = {
  attachedTo: 'rect-1',
  body: 'Needs follow-up',
  h: 36,
  id: 'comment-1',
  type: 'comment',
  w: 36,
  x: 112,
  y: 8,
}

describe('CanvasItemTransformOperations drawing items', () => {
  test('translates arrow bounds and endpoints together', () => {
    expect(translateCanvasItems([arrow], ['arrow-1'], 10, -5)[0]).toEqual({
      ...arrow,
      x: 98,
      y: 83,
      start: { x: 110, y: 95 },
      end: { x: 210, y: 115 },
    })
  })

  test('resizes arrow bounds and endpoints together', () => {
    expect(
      resizeCanvasItems(
        [arrow],
        ['arrow-1'],
        { x: 88, y: 88, w: 124, h: 44 },
        { x: 88, y: 88, w: 248, h: 88 },
      )[0],
    ).toEqual({
      ...arrow,
      w: 248,
      h: 88,
      start: { x: 100, y: 100 },
      end: { x: 324, y: 164 },
    })
  })

  test('translates marker bounds and points together', () => {
    expect(translateCanvasItems([marker], ['marker-1'], 10, -5)[0]).toEqual({
      ...marker,
      x: 108,
      y: 93,
      points: [{ x: 110, y: 95 }, { x: 210, y: 115 }],
    })
  })

  test('resizes marker bounds and points together', () => {
    expect(
      resizeCanvasItems(
        [marker],
        ['marker-1'],
        { x: 98, y: 98, w: 104, h: 24 },
        { x: 98, y: 98, w: 208, h: 48 },
      )[0],
    ).toEqual({
      ...marker,
      w: 208,
      h: 48,
      points: [{ x: 100, y: 100 }, { x: 304, y: 144 }],
    })
  })
})

describe('CanvasItemTransformOperations attached items', () => {
  test('moves attached collaboration affordances with the selected object', () => {
    expect(translateCanvasItems(
      [rect, attachedStamp, attachedComment],
      ['rect-1'],
      10,
      -5,
    )).toEqual([
      {
        ...rect,
        x: 20,
        y: 15,
      },
      {
        ...attachedStamp,
        x: 118,
        y: -7,
      },
      {
        ...attachedComment,
        x: 122,
        y: 3,
      },
    ])
  })

  test('does not move attached items when the attached object is locked', () => {
    expect(translateCanvasItems(
      [
        {
          ...rect,
          locked: true,
        },
        attachedStamp,
        attachedComment,
      ],
      ['rect-1'],
      10,
      -5,
    )).toEqual([
      {
        ...rect,
        locked: true,
      },
      attachedStamp,
      attachedComment,
    ])
  })
})

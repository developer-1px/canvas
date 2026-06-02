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

const path: CanvasItem = {
  h: 74,
  id: 'path-1',
  opacity: 1,
  segments: [
    { point: { x: 20, y: 40 }, type: 'move' },
    {
      control1: { x: 50, y: 20 },
      control2: { x: 70, y: 90 },
      point: { x: 110, y: 60 },
      type: 'cubic',
    },
  ],
  stroke: '#334155',
  strokeWidth: 4,
  type: 'path',
  w: 94,
  x: 18,
  y: 18,
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

  test('translates path bounds and typed segments together', () => {
    expect(translateCanvasItems([path], ['path-1'], 10, -5)[0]).toEqual({
      ...path,
      segments: [
        { point: { x: 30, y: 35 }, type: 'move' },
        {
          control1: { x: 60, y: 15 },
          control2: { x: 80, y: 85 },
          point: { x: 120, y: 55 },
          type: 'cubic',
        },
      ],
      x: 28,
      y: 13,
    })
  })

  test('moves only arrow endpoints attached to the selected object', () => {
    expect(translateCanvasItems(
      [
        rect,
        {
          ...arrow,
          endAttachedTo: 'rect-2',
          startAttachedTo: 'rect-1',
        },
      ],
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
        ...arrow,
        endAttachedTo: 'rect-2',
        h: 49,
        start: { x: 110, y: 95 },
        startAttachedTo: 'rect-1',
        w: 114,
        x: 98,
        y: 83,
      },
    ])
  })

  test('syncs group bounds when a selected child moves', () => {
    const child = rect
    const sibling: CanvasItem = {
      ...rect,
      h: 60,
      id: 'rect-2',
      w: 50,
      x: 200,
      y: 40,
    }

    expect(translateCanvasItems([
      {
        children: [child, sibling],
        h: 80,
        id: 'group-1',
        type: 'group',
        w: 240,
        x: 10,
        y: 20,
      },
    ], ['rect-1'], 20, 10)).toEqual([
      {
        children: [
          {
            ...child,
            x: 30,
            y: 30,
          },
          sibling,
        ],
        h: 80,
        id: 'group-1',
        type: 'group',
        w: 220,
        x: 30,
        y: 30,
      },
    ])
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

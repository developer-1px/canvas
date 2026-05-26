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

const stamp: CanvasItem = {
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

const section: CanvasItem = {
  accent: '#64748b',
  body: 'Workspace',
  component: 'section',
  fill: 'rgba(241, 245, 249, 0.42)',
  h: 220,
  id: 'section-1',
  stroke: '#94a3b8',
  title: 'Section',
  type: 'component',
  w: 340,
  x: 0,
  y: 0,
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

describe('CanvasItemTransformOperations section contents', () => {
  test('moves items contained by a selected section', () => {
    const containedRect = {
      ...rect,
      id: 'rect-contained',
      x: 40,
      y: 60,
    }
    const outsideRect = {
      ...rect,
      id: 'rect-outside',
      x: 360,
      y: 60,
    }

    expect(translateCanvasItems(
      [section, containedRect, outsideRect],
      ['section-1'],
      16,
      24,
    )).toEqual([
      {
        ...section,
        x: 16,
        y: 24,
      },
      {
        ...containedRect,
        x: 56,
        y: 84,
      },
      outsideRect,
    ])
  })

  test('moves section-contained attachments and connectors', () => {
    const containedRect = {
      ...rect,
      id: 'rect-contained',
      x: 40,
      y: 60,
    }
    const attachedToContained = {
      ...attachedComment,
      attachedTo: 'rect-contained',
      id: 'comment-contained',
      x: 150,
      y: 40,
    }
    const attachedArrow = {
      ...arrow,
      endAttachedTo: 'rect-outside',
      id: 'arrow-contained',
      start: { x: 60, y: 80 },
      startAttachedTo: 'rect-contained',
    }

    expect(translateCanvasItems(
      [section, containedRect, attachedToContained, attachedArrow],
      ['section-1'],
      10,
      20,
    )).toEqual([
      {
        ...section,
        x: 10,
        y: 20,
      },
      {
        ...containedRect,
        x: 50,
        y: 80,
      },
      {
        ...attachedToContained,
        x: 160,
        y: 60,
      },
      {
        ...attachedArrow,
        end: { x: 210, y: 140 },
        h: 64,
        start: { x: 70, y: 100 },
        w: 164,
        x: 58,
        y: 88,
      },
    ])
  })

  test('does not move locked or partially-contained items with a section', () => {
    const lockedInside = {
      ...rect,
      id: 'rect-locked',
      locked: true,
      x: 40,
      y: 60,
    }
    const partiallyOutside = {
      ...rect,
      id: 'rect-partial',
      x: 300,
      y: 60,
    }

    expect(translateCanvasItems(
      [section, lockedInside, partiallyOutside],
      ['section-1'],
      10,
      20,
    )).toEqual([
      {
        ...section,
        x: 10,
        y: 20,
      },
      lockedInside,
      partiallyOutside,
    ])
  })
})

describe('CanvasItemTransformOperations attached items', () => {
  test('moves attached comments but leaves independent stamps in place', () => {
    expect(translateCanvasItems(
      [rect, stamp, attachedComment],
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
        ...stamp,
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
        stamp,
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
      stamp,
      attachedComment,
    ])
  })
})

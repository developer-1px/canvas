import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
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
  thread: [{
    authorName: 'Ari',
    body: 'Needs follow-up',
    createdAt: '2026-06-02T00:00:00.000Z',
    id: 'message-1',
  }],
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

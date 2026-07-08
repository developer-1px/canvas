import { describe, expect, it } from 'vitest'
import type {
  CanvasItem,
  Viewport,
} from '@interactive-os/canvas'
import {
  createCanvasDevtoolsInspectSnapshot,
} from './CanvasDevtoolsInspectionModel'

const VIEWPORT: Viewport = {
  scale: 1.25,
  x: 12,
  y: 24,
}

describe('CanvasDevtoolsInspectionModel', () => {
  it('summarizes item stack, selection, and type counts', () => {
    const snapshot = createCanvasDevtoolsInspectSnapshot({
      items: [
        createRect('rect-1', 'Decision'),
        createComponent('sticky-1', 'Review note'),
        createComment('comment-1', 'Check spacing'),
      ],
      selectedItemIds: ['sticky-1'],
      viewport: VIEWPORT,
    })

    expect(snapshot.itemCount).toBe(3)
    expect(snapshot.typeCounts).toEqual([
      { count: 1, type: 'comment' },
      { count: 1, type: 'component' },
      { count: 1, type: 'rect' },
    ])
    expect(snapshot.items.map((item) => [item.id, item.layerIndex]))
      .toEqual([
        ['rect-1', 1],
        ['sticky-1', 2],
        ['comment-1', 3],
      ])
    expect(snapshot.selectedItems.map((item) => item.id))
      .toEqual(['sticky-1'])
  })

  it('extracts comment notes with attachment and resolved status', () => {
    const snapshot = createCanvasDevtoolsInspectSnapshot({
      items: [createComment('comment-1', 'Check spacing')],
      selectedItemIds: ['comment-1'],
      viewport: VIEWPORT,
    })

    expect(snapshot.comments).toEqual([{
      attachedTo: 'rect-1',
      body: 'Check spacing',
      bounds: { h: 24, w: 24, x: 80, y: 120 },
      id: 'comment-1',
      messageCount: 1,
      resolved: false,
      selected: true,
    }])
  })

  it('preserves viewport in the inspection snapshot', () => {
    const snapshot = createCanvasDevtoolsInspectSnapshot({
      items: [createRect('rect-1', 'Decision')],
      selectedItemIds: [],
      viewport: VIEWPORT,
    })

    expect(snapshot.viewport).toBe(VIEWPORT)
  })
})

function createRect(id: string, text: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    text,
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }
}

function createComponent(id: string, body: string): CanvasItem {
  return {
    accent: '#2563eb',
    body,
    component: 'sticky',
    fill: '#dbeafe',
    h: 80,
    id,
    stroke: '#93c5fd',
    title: '',
    type: 'component',
    w: 120,
    x: 40,
    y: 60,
  }
}

function createComment(id: string, body: string): CanvasItem {
  return {
    attachedTo: 'rect-1',
    body,
    h: 24,
    id,
    thread: [{
      authorName: 'Design',
      body,
      createdAt: '2026-07-08T00:00:00.000Z',
      id: `${id}:message-1`,
    }],
    type: 'comment',
    w: 24,
    x: 80,
    y: 120,
  }
}

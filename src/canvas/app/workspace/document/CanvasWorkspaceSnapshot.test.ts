import { describe, expect, test } from 'vitest'
import { MAX_SCALE } from '../../../core'
import type { CanvasItem } from '../../../entities'
import { INITIAL_ITEMS } from '../../../host'
import {
  createCanvasWorkspaceSnapshot,
  getCanvasItemIdSeed,
  parseCanvasWorkspaceSnapshot,
} from './CanvasWorkspaceSnapshot'

describe('CanvasWorkspaceSnapshot', () => {
  test('parses saved items, viewport, and valid selection ids', () => {
    const item = INITIAL_ITEMS[0]
    const snapshot = parseCanvasWorkspaceSnapshot(
      JSON.stringify({
        items: [item],
        selection: [item.id, 'missing'],
        version: 1,
        viewport: { scale: 99, x: 12, y: 24 },
      }),
    )

    expect(snapshot).toEqual({
      items: [item],
      selection: [item.id],
      version: 1,
      viewport: { scale: MAX_SCALE, x: 12, y: 24 },
    })
  })

  test('ignores malformed values and unsupported versions', () => {
    expect(parseCanvasWorkspaceSnapshot('{')).toBeNull()
    expect(
      parseCanvasWorkspaceSnapshot(
        JSON.stringify({
          items: [],
          selection: [],
          version: 2,
          viewport: { scale: 1, x: 0, y: 0 },
        }),
      ),
    ).toBeNull()
  })

  test('validates stored custom items with current validators', () => {
    const customItem: CanvasItem = {
      data: { severity: 'high' },
      h: 96,
      id: 'custom-risk-1',
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
      type: 'custom',
      w: 180,
      x: 80,
      y: 120,
    }
    const storedValue = JSON.stringify({
      items: [customItem],
      selection: [customItem.id],
      version: 1,
      viewport: { scale: 1, x: 0, y: 0 },
    })

    expect(
      parseCanvasWorkspaceSnapshot(storedValue, {
        customItemValidators: {
          risk: (item) => item.data.severity === 'low',
        },
      }),
    ).toBeNull()
    expect(
      parseCanvasWorkspaceSnapshot(storedValue, {
        customItemValidators: {
          risk: (item) => item.data.severity === 'high',
        },
      })?.items,
    ).toEqual([customItem])
  })

  test('validates built-in drawing items', () => {
    const markerItem: CanvasItem = {
      h: 24,
      id: 'marker-1',
      opacity: 1,
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
      stroke: '#475569',
      strokeWidth: 4,
      type: 'marker',
      w: 24,
      x: 8,
      y: 18,
    }

    expect(
      parseCanvasWorkspaceSnapshot(
        JSON.stringify({
          items: [{ ...markerItem, opacity: 0 }],
          selection: [markerItem.id],
          version: 1,
          viewport: { scale: 1, x: 0, y: 0 },
        }),
      ),
    ).toBeNull()
    expect(
      parseCanvasWorkspaceSnapshot(
        JSON.stringify({
          items: [markerItem],
          selection: [markerItem.id],
          version: 1,
          viewport: { scale: 1, x: 0, y: 0 },
        }),
      )?.items,
    ).toEqual([markerItem])
  })

  test('derives the next id seed from nested numeric suffixes', () => {
    const group: CanvasItem = {
      children: [
        {
          fill: '#fff',
          h: 24,
          id: 'rect-42',
          stroke: '#000',
          type: 'rect',
          w: 24,
          x: 0,
          y: 0,
        },
      ],
      h: 24,
      id: 'group-41',
      type: 'group',
      w: 24,
      x: 0,
      y: 0,
    }

    expect(getCanvasItemIdSeed([...INITIAL_ITEMS, group])).toBe(42)
    expect(getCanvasItemIdSeed(INITIAL_ITEMS)).toBe(INITIAL_ITEMS.length)
  })

  test('creates a snapshot with only existing selection ids', () => {
    const item = INITIAL_ITEMS[0]

    expect(
      createCanvasWorkspaceSnapshot({
        items: [item],
        selection: [item.id, 'missing'],
        viewport: { scale: 1, x: 0, y: 0 },
      }),
    ).toEqual({
      items: [item],
      selection: [item.id],
      version: 1,
      viewport: { scale: 1, x: 0, y: 0 },
    })
  })
})

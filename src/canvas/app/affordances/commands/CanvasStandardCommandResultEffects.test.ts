import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../../entities'
import {
  createCanvasStandardChangedItemsResultEffect,
  createCanvasStandardGroupSelectionResultEffect,
  createCanvasStandardRemoveSelectionResultEffect,
  createCanvasStandardReorderSelectionResultEffect,
} from './CanvasStandardCommandResultEffects'

const rect1 = createRectItem('rect-1')
const rect2 = createRectItem('rect-2')

describe('CanvasStandardCommandResultEffects', () => {
  it('maps changed item results to replace-changed document effects', () => {
    expect(createCanvasStandardChangedItemsResultEffect({
      result: {
        items: [rect1, rect2],
        selection: ['rect-1', 'rect-2'],
      },
    })).toEqual({
      afterSelection: ['rect-1', 'rect-2'],
      change: { type: 'replace-changed', items: [rect1, rect2] },
      fallbackSelection: undefined,
      kind: 'items-change',
    })
  })

  it('maps removal results to remove-selection document effects', () => {
    expect(createCanvasStandardRemoveSelectionResultEffect({
      result: {
        clearEditingIds: ['rect-1'],
        items: [rect2],
        selection: [],
      },
      selection: ['rect-1'],
    })).toEqual({
      afterSelection: [],
      change: { type: 'remove-selection', selection: ['rect-1'] },
      clearEditingIds: ['rect-1'],
      fallbackSelection: [],
      kind: 'items-change',
    })
  })

  it('maps group results to group-selection document effects with one id', () => {
    expect(createCanvasStandardGroupSelectionResultEffect({
      groupId: 'group-1',
      result: {
        items: [createGroupItem('group-1')],
        selection: ['group-1'],
      },
      selection: ['rect-1', 'rect-2'],
    })).toMatchObject({
      afterSelection: ['group-1'],
      change: {
        groupId: 'group-1',
        selection: ['rect-1', 'rect-2'],
        type: 'group-selection',
      },
      fallbackSelection: ['group-1'],
      kind: 'items-change',
    })
  })

  it('maps reorder results to reorder-selection document effects', () => {
    expect(createCanvasStandardReorderSelectionResultEffect({
      mode: 'bringToFront',
      result: { selection: ['rect-1'] },
      selection: ['rect-1'],
    })).toEqual({
      afterSelection: ['rect-1'],
      change: {
        mode: 'bringToFront',
        selection: ['rect-1'],
        type: 'reorder-selection',
      },
      kind: 'items-change',
    })
  })
})

function createRectItem(id: string): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 60,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
  }
}

function createGroupItem(id: string): Extract<CanvasItem, { type: 'group' }> {
  return {
    children: [rect1, rect2],
    h: 60,
    id,
    type: 'group',
    w: 80,
    x: 0,
    y: 0,
  }
}

import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import {
  addCanvasChecklistItem,
  type CanvasChecklistComponentItem,
  getCanvasChecklistCheckedItems,
  getCanvasChecklistItems,
  isCanvasChecklistItemChecked,
  removeCanvasChecklistItem,
  replaceCanvasChecklistComponentItemChecked,
  replaceCanvasChecklistComponentItemText,
  replaceCanvasChecklistComponentsWithAddedItem,
  replaceCanvasChecklistComponentsWithoutItem,
  setCanvasChecklistItemChecked,
  setCanvasChecklistItemText,
} from './CanvasChecklistComponent'

describe('CanvasChecklistComponent', () => {
  it('normalizes checklist items and checked indexes', () => {
    expect(getCanvasChecklistItems({
      ...checklist,
      items: ['', '  Owner  '],
    })).toEqual(['New item', 'Owner'])
    expect(getCanvasChecklistCheckedItems({
      ...checklist,
      checkedItems: [2, 0, 0, -1, 1.5],
    })).toEqual([0, 2])
    expect(isCanvasChecklistItemChecked({
      ...checklist,
      checkedItems: [1],
    }, 1)).toBe(true)
  })

  it('updates checklist item text and checked state', () => {
    expect(setCanvasChecklistItemText(checklist, 1, '  Design  '))
      .toMatchObject({
        items: ['Scope', 'Design', 'Next'],
      })
    expect(setCanvasChecklistItemChecked(checklist, 1, true))
      .toMatchObject({
        checkedItems: [0, 1],
        items: ['Scope', 'Owner', 'Next'],
      })
    expect(setCanvasChecklistItemChecked({
      ...checklist,
      checkedItems: [0, 1],
    }, 0, false)).toMatchObject({
      checkedItems: [1],
    })
  })

  it('adds and removes checklist items while keeping checked indexes aligned', () => {
    expect(addCanvasChecklistItem(checklist, 'Review')).toMatchObject({
      h: 184,
      items: ['Scope', 'Owner', 'Next', 'Review'],
    })
    expect(removeCanvasChecklistItem({
      ...checklist,
      checkedItems: [0, 2],
    }, 1)).toMatchObject({
      checkedItems: [0, 1],
      items: ['Scope', 'Next'],
    })
  })

  it('replaces selected checklist components inside an item tree', () => {
    const group: CanvasItem = {
      children: [checklist, rect],
      h: 180,
      id: 'group-1',
      type: 'group',
      w: 260,
      x: 0,
      y: 0,
    }

    expect(replaceCanvasChecklistComponentItemText(
      [group],
      ['component-checklist'],
      2,
      'Ship',
    )).toEqual([{
      ...group,
      children: [
        {
          ...checklist,
          items: ['Scope', 'Owner', 'Ship'],
        },
        rect,
      ],
    }])
    expect(replaceCanvasChecklistComponentItemChecked(
      [checklist],
      ['component-checklist'],
      1,
      true,
    )[0]).toMatchObject({ checkedItems: [0, 1] })
    expect(replaceCanvasChecklistComponentsWithAddedItem(
      [checklist],
      ['component-checklist'],
      'Review',
    )[0]).toMatchObject({
      items: ['Scope', 'Owner', 'Next', 'Review'],
    })
    expect(replaceCanvasChecklistComponentsWithoutItem(
      [checklist],
      ['component-checklist'],
      0,
    )[0]).toMatchObject({
      checkedItems: [],
      items: ['Owner', 'Next'],
    })
  })
})

const checklist: CanvasChecklistComponentItem = {
  accent: '#16a34a',
  checkedItems: [0],
  component: 'checklist',
  fill: '#ffffff',
  h: 156,
  id: 'component-checklist',
  items: ['Scope', 'Owner', 'Next'],
  stroke: '#cbd5e1',
  title: 'Checklist',
  type: 'component',
  w: 224,
  x: 40,
  y: 80,
}

const rect: CanvasItem = {
  fill: '#ffffff',
  h: 80,
  id: 'rect-1',
  stroke: '#111827',
  type: 'rect',
  w: 120,
  x: 0,
  y: 0,
}

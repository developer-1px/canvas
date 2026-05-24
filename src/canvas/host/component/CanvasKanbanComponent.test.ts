import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import {
  addCanvasKanbanCard,
  type CanvasKanbanComponentItem,
  getCanvasKanbanCards,
  moveCanvasKanbanCard,
  removeCanvasKanbanCard,
  replaceCanvasKanbanComponentCardText,
  replaceCanvasKanbanComponentsWithAddedCard,
  replaceCanvasKanbanComponentsWithMovedCard,
  replaceCanvasKanbanComponentsWithoutCard,
  setCanvasKanbanCardText,
} from './CanvasKanbanComponent'

describe('CanvasKanbanComponent', () => {
  it('normalizes kanban cards', () => {
    expect(getCanvasKanbanCards({
      ...kanban,
      items: ['', '  Doing  '],
    })).toEqual(['New card', 'Doing'])
    expect(getCanvasKanbanCards({
      ...kanban,
      items: [],
    })).toEqual(['New card'])
  })

  it('updates kanban card text, insertion, removal, and order', () => {
    expect(setCanvasKanbanCardText(kanban, 1, '  Doing  '))
      .toMatchObject({
        items: ['Now', 'Doing', 'Later'],
      })
    expect(addCanvasKanbanCard(kanban, 'Done')).toMatchObject({
      h: 230,
      items: ['Now', 'Next', 'Later', 'Done'],
    })
    expect(removeCanvasKanbanCard(kanban, 1)).toMatchObject({
      items: ['Now', 'Later'],
    })
    expect(moveCanvasKanbanCard(kanban, 2, 'up')).toMatchObject({
      items: ['Now', 'Later', 'Next'],
    })
    expect(moveCanvasKanbanCard(kanban, 0, 'down')).toMatchObject({
      items: ['Next', 'Now', 'Later'],
    })
  })

  it('replaces selected kanban components inside an item tree', () => {
    const group: CanvasItem = {
      children: [kanban, rect],
      h: 200,
      id: 'group-1',
      type: 'group',
      w: 280,
      x: 0,
      y: 0,
    }

    expect(replaceCanvasKanbanComponentCardText(
      [group],
      ['component-kanban'],
      2,
      'Done',
    )).toEqual([{
      ...group,
      children: [
        {
          ...kanban,
          items: ['Now', 'Next', 'Done'],
        },
        rect,
      ],
    }])
    expect(replaceCanvasKanbanComponentsWithAddedCard(
      [kanban],
      ['component-kanban'],
      'Done',
    )[0]).toMatchObject({
      items: ['Now', 'Next', 'Later', 'Done'],
    })
    expect(replaceCanvasKanbanComponentsWithoutCard(
      [kanban],
      ['component-kanban'],
      0,
    )[0]).toMatchObject({
      items: ['Next', 'Later'],
    })
    expect(replaceCanvasKanbanComponentsWithMovedCard(
      [kanban],
      ['component-kanban'],
      2,
      'up',
    )[0]).toMatchObject({
      items: ['Now', 'Later', 'Next'],
    })
  })
})

const kanban: CanvasKanbanComponentItem = {
  accent: '#7c3aed',
  component: 'kanban',
  fill: '#f8fafc',
  h: 190,
  id: 'component-kanban',
  items: ['Now', 'Next', 'Later'],
  stroke: '#cbd5e1',
  title: 'Queue',
  type: 'component',
  w: 214,
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

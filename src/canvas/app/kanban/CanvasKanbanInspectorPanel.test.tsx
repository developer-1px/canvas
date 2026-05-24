import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  addCanvasKanbanCard,
  CANVAS_KANBAN_INSPECTOR_PANEL,
  changeCanvasKanbanCardText,
  moveCanvasKanbanCard,
  removeCanvasKanbanCard,
} from './CanvasKanbanInspectorPanel'

describe('CanvasKanbanInspectorPanel', () => {
  it('renders editable queue rows for a selected kanban component', () => {
    const markup = renderToStaticMarkup(
      CANVAS_KANBAN_INSPECTOR_PANEL.render({
        bounds: kanban,
        commitItemsChange: vi.fn(),
        disabled: false,
        items: [kanban],
        label: 'Queue',
        selectedItems: [kanban],
        selection: ['component-kanban'],
      }),
    )

    expect(markup).toContain('Queue card 2')
    expect(markup).toContain('Move Now down')
    expect(markup).toContain('Move Later up')
    expect(markup).toContain('Remove Next')
    expect(markup).toContain('Add')
  })

  it('changes text, add, remove, and order through document commits', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = {
      bounds: kanban,
      commitItemsChange,
      disabled: false,
      items: [kanban, rect],
      label: 'Queue',
      selectedItems: [kanban],
      selection: ['component-kanban'],
    }

    expect(changeCanvasKanbanCardText(context, 1, 'Doing')).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...kanban,
          items: ['Now', 'Doing', 'Later'],
        },
        rect,
      ],
    }, {
      after: ['component-kanban'],
      before: ['component-kanban'],
    })

    expect(addCanvasKanbanCard(context)).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...kanban,
          h: 230,
          items: ['Now', 'Next', 'Later', 'New card'],
        },
        rect,
      ],
    }, {
      after: ['component-kanban'],
      before: ['component-kanban'],
    })

    expect(removeCanvasKanbanCard(context, 0)).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...kanban,
          items: ['Next', 'Later'],
        },
        rect,
      ],
    }, {
      after: ['component-kanban'],
      before: ['component-kanban'],
    })

    expect(moveCanvasKanbanCard(context, 2, 'up')).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...kanban,
          items: ['Now', 'Later', 'Next'],
        },
        rect,
      ],
    }, {
      after: ['component-kanban'],
      before: ['component-kanban'],
    })
  })
})

const kanban: Extract<CanvasItem, { type: 'component' }> = {
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

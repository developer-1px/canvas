import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  addCanvasChecklistItem,
  CANVAS_CHECKLIST_INSPECTOR_PANEL,
  changeCanvasChecklistItemChecked,
  changeCanvasChecklistItemText,
  removeCanvasChecklistItem,
} from './CanvasChecklistInspectorPanel'

describe('CanvasChecklistInspectorPanel', () => {
  it('renders editable checklist rows for a selected checklist component', () => {
    const markup = renderToStaticMarkup(
      CANVAS_CHECKLIST_INSPECTOR_PANEL.render({
        bounds: checklist,
        commitItemsChange: vi.fn(),
        disabled: false,
        items: [checklist],
        label: 'Checklist',
        selectedItems: [checklist],
        selection: ['component-checklist'],
      }),
    )

    expect(markup).toContain('Toggle Scope')
    expect(markup).toContain('Checklist item 2')
    expect(markup).toContain('Remove Next')
    expect(markup).toContain('Add')
  })

  it('changes checked state, text, add, and remove through document commits', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = {
      bounds: checklist,
      commitItemsChange,
      disabled: false,
      items: [checklist, rect],
      label: 'Checklist',
      selectedItems: [checklist],
      selection: ['component-checklist'],
    }

    expect(changeCanvasChecklistItemChecked(context, 1, true)).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...checklist,
          checkedItems: [0, 1],
        },
        rect,
      ],
    }, {
      after: ['component-checklist'],
      before: ['component-checklist'],
    })

    expect(changeCanvasChecklistItemText(context, 2, 'Ship')).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...checklist,
          items: ['Scope', 'Owner', 'Ship'],
        },
        rect,
      ],
    }, {
      after: ['component-checklist'],
      before: ['component-checklist'],
    })

    expect(addCanvasChecklistItem(context)).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...checklist,
          h: 184,
          items: ['Scope', 'Owner', 'Next', 'New item'],
        },
        rect,
      ],
    }, {
      after: ['component-checklist'],
      before: ['component-checklist'],
    })

    expect(removeCanvasChecklistItem(context, 0)).toBe(true)
    expect(commitItemsChange).toHaveBeenLastCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...checklist,
          checkedItems: [],
          items: ['Owner', 'Next'],
        },
        rect,
      ],
    }, {
      after: ['component-checklist'],
      before: ['component-checklist'],
    })
  })
})

const checklist: Extract<CanvasItem, { type: 'component' }> = {
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

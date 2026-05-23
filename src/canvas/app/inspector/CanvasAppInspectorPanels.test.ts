import { describe, expect, it, vi } from 'vitest'
import type { CanvasAppInspectorPanelContext } from './CanvasAppInspectorPanels'
import {
  getCanvasAppInspectorPanelViews,
  type CanvasAppInspectorPanel,
} from './CanvasAppInspectorPanels'

const context: CanvasAppInspectorPanelContext = {
  bounds: { x: 0, y: 0, w: 100, h: 80 },
  commitItemsChange: vi.fn(),
  disabled: false,
  label: 'Card',
  selectedItems: [
    {
      id: 'component-card',
      type: 'component',
      component: 'card',
      x: 0,
      y: 0,
      w: 100,
      h: 80,
      title: 'Card',
      fill: '#fff',
      stroke: '#000',
      accent: '#2563eb',
    },
  ],
  selection: ['component-card'],
}

describe('CanvasAppInspectorPanels', () => {
  it('derives visible panel views from externally registered inspector panels', () => {
    const panels: CanvasAppInspectorPanel[] = [
      {
        id: 'component-meta',
        isVisible: ({ selectedItems }) =>
          selectedItems.some((item) => item.type === 'component'),
        render: ({ label }) => label,
      },
      {
        id: 'empty-selection',
        isVisible: ({ selection }) => selection.length === 0,
        render: () => null,
      },
    ]

    expect(getCanvasAppInspectorPanelViews({ context, panels })).toEqual([
      {
        content: 'Card',
        id: 'component-meta',
      },
    ])
  })
})

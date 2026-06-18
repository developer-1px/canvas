import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppInspectorPanelViews } from './CanvasAppInspectorPanelExecution'
import { assertCanvasAppInspectorPanels } from './CanvasAppInspectorPanelContracts'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from './CanvasAppInspectorPanels'

const context: CanvasAppInspectorPanelContext = {
  bounds: { x: 0, y: 0, w: 100, h: 80 },
  commitItemsChange: vi.fn(),
  customFocus: null,
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

  it('omits external inspector panels that fail visibility or rendering', () => {
    const panels: CanvasAppInspectorPanel[] = [
      {
        id: 'bad-visibility',
        isVisible: () => {
          throw new Error('bad visibility')
        },
        render: () => 'bad',
      },
      {
        id: 'bad-render',
        render: () => {
          throw new Error('bad render')
        },
      },
      {
        id: 'stable-panel',
        render: ({ label }) => label,
      },
    ]

    expect(getCanvasAppInspectorPanelViews({ context, panels })).toEqual([
      {
        content: 'Card',
        id: 'stable-panel',
      },
    ])
  })

  it('rejects malformed inspector panel descriptors before registration', () => {
    expect(() =>
      assertCanvasAppInspectorPanels({} as unknown as CanvasAppInspectorPanel[]),
    ).toThrow('Canvas app inspector panel descriptors must be an array')

    expect(() =>
      assertCanvasAppInspectorPanels([
        {
          id: 'risk-meta',
        } as unknown as CanvasAppInspectorPanel,
      ]),
    ).toThrow('Canvas app inspector panel risk-meta requires render')

    expect(() =>
      assertCanvasAppInspectorPanels([
        {
          id: 'risk-meta',
          isVisible: true,
          render: () => null,
        } as unknown as CanvasAppInspectorPanel,
      ]),
    ).toThrow('Canvas app inspector panel risk-meta requires isVisible')
  })
})

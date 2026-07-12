import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppInspectorPanelViews } from './CanvasAppInspectorPanelExecution'
import { assertCanvasAppInspectorPanels } from './CanvasAppInspectorPanelContracts'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from './CanvasAppInspectorPanels'
import { createCanvasAppDocumentAuthority, createCanvasAppDocumentAuthorityRead } from '../../workflow/CanvasAppDocumentAuthority'
import {
  CANVAS_APP_EDITOR_CAPABILITIES,
  CANVAS_APP_READ_ONLY_CAPABILITIES,
} from '../../workflow/CanvasAppCapabilityAssembly'

const context: CanvasAppInspectorPanelContext = {
  bounds: { x: 0, y: 0, w: 100, h: 80 },
  customFocus: null,
  disabled: false,
  document: createCanvasAppDocumentAuthority({
    commitItemsChange: vi.fn(() => true),
    read: createCanvasAppDocumentAuthorityRead(
      CANVAS_APP_EDITOR_CAPABILITIES,
    ),
    readItems: () => [],
  }),
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
        requiredCapability: 'view',
      },
      {
        id: 'empty-selection',
        isVisible: ({ selection }) => selection.length === 0,
        render: () => null,
        requiredCapability: 'view',
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
        requiredCapability: 'view',
      },
      {
        id: 'bad-render',
        render: () => {
          throw new Error('bad render')
        },
        requiredCapability: 'view',
      },
      {
        id: 'stable-panel',
        render: ({ label }) => label,
        requiredCapability: 'view',
      },
    ]

    expect(getCanvasAppInspectorPanelViews({ context, panels })).toEqual([
      {
        content: 'Card',
        id: 'stable-panel',
      },
    ])
  })

  it('denies a mutation attempted by a directly rendered view-only panel', () => {
    const commitItemsChange = vi.fn(() => true)
    const viewOnlyContext: CanvasAppInspectorPanelContext = {
      ...context,
      document: createCanvasAppDocumentAuthority({
        commitItemsChange,
        read: createCanvasAppDocumentAuthorityRead(
          CANVAS_APP_READ_ONLY_CAPABILITIES,
        ),
        readItems: () => [],
      }),
    }
    const panel: CanvasAppInspectorPanel = {
      id: 'view-and-attempt-edit',
      requiredCapability: 'view',
      render: ({ document }) => {
        const result = document.commit({
          change: {
            items: [{
              fill: '#fff',
              h: 80,
              id: 'rect-1',
              stroke: '#111',
              type: 'rect',
              w: 120,
              x: 0,
              y: 0,
            }],
            type: 'add',
          },
        })

        return result.ok ? 'allowed' : result.code
      },
    }

    expect(getCanvasAppInspectorPanelViews({
      context: viewOnlyContext,
      panels: [panel],
    })).toEqual([{
      content: 'capability-denied',
      id: panel.id,
    }])
    expect(commitItemsChange).not.toHaveBeenCalled()
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
          requiredCapability: 'view',
          render: () => null,
        } as unknown as CanvasAppInspectorPanel,
      ]),
    ).toThrow('Canvas app inspector panel risk-meta requires isVisible')

    expect(() =>
      assertCanvasAppInspectorPanels([
        {
          id: 'risk-meta',
          render: () => null,
        } as unknown as CanvasAppInspectorPanel,
      ]),
    ).toThrow(
      'Canvas app inspector panel risk-meta requires requiredCapability',
    )
  })
})

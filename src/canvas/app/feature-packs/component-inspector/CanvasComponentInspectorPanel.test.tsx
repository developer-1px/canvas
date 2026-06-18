import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../entities'
import {
  createCanvasComponentDefinitionRegistry,
} from '../../../host'
import type {
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'
import {
  CANVAS_COMPONENT_INSPECTOR_PANEL,
  getCanvasComponentInspectorPanelModel,
} from './CanvasComponentInspectorPanel'

describe('CanvasComponentInspectorPanel', () => {
  it('shows registry binding details for a selected component part', () => {
    const context = createContext()
    const model = getCanvasComponentInspectorPanelModel(context)
    const markup = renderToStaticMarkup(
      <>{CANVAS_COMPONENT_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(CANVAS_COMPONENT_INSPECTOR_PANEL.isVisible?.(context)).toBe(true)
    expect(model).toMatchObject({
      componentId: 'score-card',
      componentLabel: 'Score card',
      currentItemId: 'score-card-value-a',
      instanceCount: 2,
      instanceLabel: 'Score card A',
      isRootItem: false,
      slotId: 'value',
      slotItemIds: ['score-card-value-a', 'score-card-value-b'],
      syncDescription: 'Value slots update together',
    })
    expect(markup).toContain('Component')
    expect(markup).toContain('Score card')
    expect(markup).toContain('Instance')
    expect(markup).toContain('Score card A')
    expect(markup).toContain('Slot')
    expect(markup).toContain('value')
    expect(markup).toContain('Linked')
    expect(markup).toContain('score-card-value-a')
    expect(markup).toContain('score-card-value-b')
  })

  it('stays hidden for empty, multi, or unbound selections', () => {
    expect(CANVAS_COMPONENT_INSPECTOR_PANEL.isVisible?.(createContext({
      selectedItems: [],
      selection: [],
    }))).toBe(false)
    expect(CANVAS_COMPONENT_INSPECTOR_PANEL.isVisible?.(createContext({
      selectedItems: [createRectItem('score-card-value-a')],
      selection: ['score-card-value-a', 'score-card-value-b'],
    }))).toBe(false)
    expect(CANVAS_COMPONENT_INSPECTOR_PANEL.isVisible?.(createContext({
      selectedItems: [createRectItem('unbound')],
      selection: ['unbound'],
    }))).toBe(false)
  })
})

function createContext(
  overrides: Partial<CanvasAppInspectorPanelContext> = {},
): CanvasAppInspectorPanelContext {
  const item = createRectItem('score-card-value-a')

  return {
    bounds: item,
    commitItemsChange: vi.fn(() => true),
    componentDefinitionRegistry: createCanvasComponentDefinitionRegistry({
      definitions: [{
        id: 'score-card',
        instances: [
          {
            label: 'Score card A',
            slots: {
              root: 'score-card-root-a',
              value: 'score-card-value-a',
            },
          },
          {
            label: 'Score card B',
            slots: {
              root: 'score-card-root-b',
              value: 'score-card-value-b',
            },
          },
        ],
        label: 'Score card',
        syncDescription: 'Value slots update together',
      }],
    }),
    disabled: false,
    items: [
      createRectItem('score-card-root-a'),
      item,
      createRectItem('score-card-root-b'),
      createRectItem('score-card-value-b'),
    ],
    label: 'Shape',
    selectedItems: [item],
    selection: [item.id],
    ...overrides,
  }
}

function createRectItem(id: string): CanvasItem {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }
}

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../entities'
import { createCanvasAppTestDocumentAuthority } from '../../workflow/CanvasAppDocumentAuthorityTestFixtures'
import {
  CANVAS_ARROW_ROUTING_INSPECTOR_PANEL,
  changeCanvasArrowRouting,
} from './CanvasArrowRoutingInspectorPanel'

describe('CanvasArrowRoutingInspectorPanel', () => {
  it('renders connector routing actions for a selected arrow', () => {
    const markup = renderToStaticMarkup(
      CANVAS_ARROW_ROUTING_INSPECTOR_PANEL.render({
        bounds: createArrowItem(),
        disabled: false,
        document: createCanvasAppTestDocumentAuthority(),
        items: [createArrowItem()],
        label: 'Connector',
        selectedItems: [createArrowItem()],
        selection: ['arrow-1'],
      }),
    )

    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('Elbow connector')
    expect(markup).toContain('role="radio"')
    expect(markup).toContain('aria-checked="true"')
    expect(markup).toContain('Straight connector')
  })

  it('changes the selected connector routing', () => {
    const commitItemsChange = vi.fn(() => true)
    const arrow = createArrowItem()

    expect(changeCanvasArrowRouting({
      bounds: arrow,
      disabled: false,
      document: createCanvasAppTestDocumentAuthority({
        commitItemsChange,
        readItems: () => [arrow, createRectItem()],
      }),
      items: [arrow, createRectItem()],
      label: 'Connector',
      selectedItems: [arrow],
      selection: ['arrow-1'],
    }, 'straight')).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'replace-changed',
      items: [
        {
          ...arrow,
          routing: 'straight',
        },
        createRectItem(),
      ],
    }, {
      after: ['arrow-1'],
      before: ['arrow-1'],
    })
  })
})

function createArrowItem(
  overrides: Partial<Extract<CanvasItem, { type: 'arrow' }>> = {},
): Extract<CanvasItem, { type: 'arrow' }> {
  return {
    end: { x: 160, y: 120 },
    h: 124,
    id: 'arrow-1',
    routing: 'elbow',
    start: { x: 40, y: 40 },
    stroke: '#334155',
    strokeWidth: 3,
    type: 'arrow',
    w: 144,
    x: 28,
    y: 28,
    ...overrides,
  }
}

function createRectItem(): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 80,
    id: 'rect-1',
    stroke: '#111827',
    type: 'rect',
    w: 120,
    x: 0,
    y: 0,
  }
}

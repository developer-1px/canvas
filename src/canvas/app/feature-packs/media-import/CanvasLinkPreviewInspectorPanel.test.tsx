import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  createCanvasLinkPreviewComponentItem,
} from '../../../host'
import type { CanvasAppInspectorPanelContext } from '../../extensions/inspector-panels'
import {
  CANVAS_LINK_PREVIEW_INSPECTOR_PANEL,
  changeCanvasLinkPreviewBackToText,
  changeCanvasLinkPreviewOrientation,
} from './CanvasLinkPreviewInspectorPanel'

describe('CanvasLinkPreviewInspectorPanel', () => {
  it('shows open and text actions for a single selected link preview', () => {
    const context = createContext()
    const markup = renderToStaticMarkup(
      <>{CANVAS_LINK_PREVIEW_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(CANVAS_LINK_PREVIEW_INSPECTOR_PANEL.isVisible?.(context)).toBe(true)
    expect(markup).toContain('href="https://www.figma.com/figjam/"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('Display horizontal')
    expect(markup).toContain('role="radio"')
    expect(markup).toContain('aria-checked="true"')
    expect(markup).toContain('Display vertical')
    expect(markup).toContain('Open')
    expect(markup).toContain('Text')
  })

  it('changes the selected link preview back to source URL text', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeCanvasLinkPreviewBackToText(context)).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'replace-changed',
        items: [
          expect.objectContaining({ id: 'rect-1', type: 'rect' }),
          expect.objectContaining({
            id: 'component-link-1',
            text: 'https://www.figma.com/figjam/',
            type: 'text',
          }),
        ],
      },
      {
        before: ['component-link-1'],
        after: ['component-link-1'],
      },
    )
  })

  it('changes the selected link preview orientation', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeCanvasLinkPreviewOrientation(context, 'vertical')).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'replace-changed',
        items: [
          expect.objectContaining({ id: 'rect-1', type: 'rect' }),
          expect.objectContaining({
            h: 260,
            id: 'component-link-1',
            orientation: 'vertical',
            w: 220,
          }),
        ],
      },
      {
        before: ['component-link-1'],
        after: ['component-link-1'],
      },
    )
  })

  it('stays hidden for multi-selection or non-link-preview selections', () => {
    expect(CANVAS_LINK_PREVIEW_INSPECTOR_PANEL.isVisible?.(createContext({
      selectedItems: [createRectItem()],
      selection: ['rect-1'],
    }))).toBe(false)
    expect(CANVAS_LINK_PREVIEW_INSPECTOR_PANEL.isVisible?.(createContext({
      selectedItems: [createRectItem(), createLinkPreviewItem()],
      selection: ['rect-1', 'component-link-1'],
    }))).toBe(false)
  })
})

function createContext(
  overrides: Partial<CanvasAppInspectorPanelContext> = {},
): CanvasAppInspectorPanelContext {
  const linkPreviewItem = createLinkPreviewItem()

  return {
    bounds: linkPreviewItem,
    commitItemsChange: vi.fn(() => true),
    componentDefinitionRegistry: CANVAS_COMPONENT_DEFINITION_REGISTRY,
    disabled: false,
    items: [createRectItem(), linkPreviewItem],
    label: 'Link preview',
    selectedItems: [linkPreviewItem],
    selection: [linkPreviewItem.id],
    ...overrides,
  }
}

function createLinkPreviewItem() {
  return createCanvasLinkPreviewComponentItem({
    id: 'component-link-1',
    point: { x: 100, y: 120 },
    url: 'https://www.figma.com/figjam/',
  })
}

function createRectItem() {
  return {
    fill: '#ffffff',
    h: 40,
    id: 'rect-1',
    stroke: '#111111',
    type: 'rect' as const,
    w: 80,
    x: 10,
    y: 20,
  }
}

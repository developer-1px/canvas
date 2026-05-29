import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  HTML_SPECIMEN_CSS_INSPECTOR_PANEL,
  changeHtmlSpecimenPreviewTargetCss,
} from './HtmlSpecimenCssInspectorPanel'
import { createButtonSpecimenData } from './HtmlSpecimenCustomItemModel'

describe('HtmlSpecimenCssInspectorPanel', () => {
  it('renders compact CSS controls for the focused preview node', () => {
    const context = createContext()

    expect(HTML_SPECIMEN_CSS_INSPECTOR_PANEL.isVisible?.(context)).toBe(true)

    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('button.primary')
    expect(markup).toContain('Text')
    expect(markup).toContain('#ffffff')
    expect(markup).toContain('Font')
    expect(markup).toContain('14px')
    expect(markup).toContain('Radius')
    expect(markup).toContain('Margin')
    expect(markup).toContain('0px')
    expect(markup).toContain('Rule .button / 3 nodes')
    expect(markup).toContain('Rule .primary / 1 node')
    expect(markup).toContain('Add .primary / 1 node')
  })

  it('patches stylesheet text for the focused preview node', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111111',
      property: 'color',
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              css: expect.stringContaining('color: #111111;'),
              html: createButtonSpecimenData().html,
            }),
          }),
        ],
        type: 'replace-changed',
      },
      {
        after: ['html-specimen-1'],
        before: ['html-specimen-1'],
      },
    )
  })

  it('adds supported CSS declarations through the shared patch path', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({ commitItemsChange })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '16px',
      property: 'font-size',
    })).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              css: expect.stringContaining('font-size: 16px;'),
              html: createButtonSpecimenData().html,
            }),
          }),
        ],
        type: 'replace-changed',
      },
      {
        after: ['html-specimen-1'],
        before: ['html-specimen-1'],
      },
    )
  })

  it('stays hidden when custom focus belongs to another item', () => {
    expect(HTML_SPECIMEN_CSS_INSPECTOR_PANEL.isVisible?.(
      createContext({
        customFocus: {
          itemId: 'other',
          ownerId: 'html-specimen',
          targetId: 'dom:primary',
        },
      }),
    )).toBe(false)
  })

  it('shows unresolved controls when the focused node has no matching rule', () => {
    const commitItemsChange = vi.fn(() => true)
    const orphanNode = {
      attributes: {
        class: 'orphan',
        id: 'orphan',
      },
      classList: ['orphan'],
      computedStyle: {
        color: '#111111',
      },
      id: 'dom:orphan',
      tagName: 'div',
    }
    const context = createContext({
      commitItemsChange,
      customFocus: {
        data: {
          node: orphanNode,
          nodes: [orphanNode],
        },
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:orphan',
      },
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('No matching rule')
    expect(markup).toContain('disabled=""')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#222222',
      property: 'color',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })
})

function createContext({
  commitItemsChange = vi.fn(() => true),
  customFocus,
}: {
  commitItemsChange?: CanvasAppInspectorPanelContext['commitItemsChange']
  customFocus?: CanvasAppInspectorPanelContext['customFocus']
} = {}): CanvasAppInspectorPanelContext {
  const item = createHtmlSpecimenItem()
  const node = {
    attributes: {
      class: 'button primary',
      id: 'primary',
    },
    classList: ['button', 'primary'],
    computedStyle: {
      color: '#ffffff',
      backgroundColor: '#2563eb',
      borderRadius: '6px',
      fontSize: '14px',
      margin: '0px',
      padding: '0px',
    },
    id: 'dom:primary',
    tagName: 'button',
  }

  return {
    bounds: item,
    commitItemsChange,
    customFocus: customFocus ?? {
      data: {
        node,
        nodes: [
          node,
          {
            ...node,
            attributes: {
              class: 'button secondary',
              id: 'secondary',
            },
            classList: ['button', 'secondary'],
            id: 'dom:secondary',
          },
          {
            ...node,
            attributes: {
              class: 'button danger',
              id: 'danger',
            },
            classList: ['button', 'danger'],
            id: 'dom:danger',
          },
        ],
      },
      itemId: 'html-specimen-1',
      ownerId: 'html-specimen',
      targetId: 'dom:primary',
    },
    disabled: false,
    items: [item],
    label: 'HTML specimen',
    selectedItems: [item],
    selection: ['html-specimen-1'],
  }
}

function createHtmlSpecimenItem(): CanvasCustomItem {
  return {
    data: createButtonSpecimenData(),
    h: 250,
    id: 'html-specimen-1',
    kind: 'html-specimen',
    presentation: 'html-specimen',
    title: 'Button specimen',
    type: 'custom',
    w: 380,
    x: 80,
    y: 120,
  }
}

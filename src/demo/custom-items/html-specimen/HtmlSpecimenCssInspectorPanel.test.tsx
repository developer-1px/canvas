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
    expect(markup).toContain('Stroke')
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

  it('edits safe token-backed declarations through the token definition', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({
      commitItemsChange,
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `:root, html {
  --brand: #2563eb;
}
.primary {
  background: var(--brand, #0f172a);
}`,
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('#2563eb')
    expect(markup).toContain('Token :root, html / 1 node')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111827',
      property: 'background-color',
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            data: expect.objectContaining({
              css: expect.stringContaining('--brand: #111827;'),
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

  it('skips stylesheet patches when the requested value already matches computed style', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({
      commitItemsChange,
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `:root {
  --brand: #2563eb;
}
.primary {
  background: var(--brand);
}`,
      }),
    })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#2563eb',
      property: 'background-color',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('shows shorthand conflicts as non-editable', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({
      commitItemsChange,
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  margin-top: 4px;
}`,
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('Conflict .primary / 1 node')
    expect(markup).toContain('disabled=""')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '8px',
      property: 'margin',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('edits scoped at-rule declarations through the shared patch path', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({
      commitItemsChange,
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `@media (min-width: 1px) {
  .primary {
    color: #ffffff;
  }
}`,
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('#ffffff')
    expect(markup).toContain('Scoped @media (min-width: 1px) / .primary / 1 node')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111827',
      property: 'color',
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              css: expect.stringContaining('color: #111827;'),
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

  it('ignores inactive media declarations in inspector source labels', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({
      commitItemsChange,
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  color: #334155;
}
@media (min-width: 1000px) {
  .primary {
    color: #ffffff;
  }
}`,
        viewportWidth: 360,
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('#334155')
    expect(markup).toContain('Rule .primary / 1 node')
    expect(markup).not.toContain('Scoped @media (min-width: 1000px)')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111827',
      property: 'color',
    })).toBe(true)
    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        items: [
          expect.objectContaining({
            id: 'html-specimen-1',
            data: expect.objectContaining({
              css: expect.stringContaining('color: #111827;'),
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

  it('shows winning inline styles as non-editable', () => {
    const commitItemsChange = vi.fn(() => true)
    const inlineNode = {
      attributes: {
        class: 'primary',
        id: 'primary',
        style: 'color: #ef4444;',
      },
      classList: ['primary'],
      computedStyle: {
        color: '#ef4444',
      },
      id: 'dom:primary',
      tagName: 'button',
    }
    const context = createContext({
      commitItemsChange,
      customFocus: {
        data: {
          node: inlineNode,
          nodes: [inlineNode],
        },
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:primary',
      },
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  color: #334155;
}`,
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('#ef4444')
    expect(markup).toContain('Inline style / 1 node')
    expect(markup).toContain('disabled=""')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111827',
      property: 'color',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
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
  item = createHtmlSpecimenItem(),
}: {
  commitItemsChange?: CanvasAppInspectorPanelContext['commitItemsChange']
  customFocus?: CanvasAppInspectorPanelContext['customFocus']
  item?: CanvasCustomItem
} = {}): CanvasAppInspectorPanelContext {
  const node = {
    attributes: {
      class: 'button primary',
      id: 'primary',
    },
    classList: ['button', 'primary'],
    computedStyle: {
      color: '#ffffff',
      backgroundColor: '#2563eb',
      borderColor: 'transparent',
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

function createHtmlSpecimenItem(
  data = createButtonSpecimenData(),
): CanvasCustomItem {
  return {
    data,
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

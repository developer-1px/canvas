import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  HTML_SPECIMEN_CSS_INSPECTOR_PANEL,
  changeHtmlSpecimenPreviewTargetCss,
} from './HtmlSpecimenCssInspectorPanel'
import {
  createContext,
  createHtmlSpecimenItem,
} from './HtmlSpecimenCssInspectorPanel.testSupport'
import { createButtonSpecimenData } from './HtmlSpecimenCustomItemModel'

describe('HtmlSpecimenCssInspectorPanel rule source display', () => {
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
    expect(markup).toContain('@media (min-width: 1px) / .primary · 1 node')
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
    expect(markup).toContain('.primary · 1 node')
    expect(markup).not.toContain('@media (min-width: 1000px)')
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
    expect(markup).toContain('inline style · 1 node')
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

  it('renders recorded stylesheet changes', () => {
    const context = createContext({
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        cssChanges: [
          {
            affectedNodeCount: 1,
            kind: 'update',
            property: 'color',
            selector: '.primary',
            target: 'button.primary',
            value: '#111827',
          },
        ],
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('Patch')
    expect(markup).toContain('1 edits')
    expect(markup).toContain('color')
    expect(markup).toContain('#111827')
    expect(markup).toContain('.primary · 1 node')
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  HTML_SPECIMEN_CSS_INSPECTOR_PANEL,
  changeHtmlSpecimenPreviewTargetCss,
} from './HtmlSpecimenCssInspectorPanel'
import {
  createContext,
  createFocusNode,
  createHtmlSpecimenItem,
} from './HtmlSpecimenCssInspectorPanel.testSupport'
import { createButtonSpecimenData } from './HtmlSpecimenCustomItemModel'

describe('HtmlSpecimenCssInspectorPanel patch guards', () => {
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
    expect(markup).toContain('token :root, html · 1 node')
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

  it('skips color patches when requested color is equivalent to computed style', () => {
    const commitItemsChange = vi.fn(() => true)
    const node = createFocusNode({
      computedStyle: {
        backgroundColor: 'rgb(37, 99, 235)',
      },
    })
    const context = createContext({
      commitItemsChange,
      customFocus: {
        data: {
          node,
          nodes: [node],
        },
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:primary',
      },
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  background: #2563eb;
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

  it('skips zero length patches when requested value is equivalent to computed style', () => {
    const commitItemsChange = vi.fn(() => true)
    const node = createFocusNode({
      computedStyle: {
        borderRadius: '0px',
      },
    })
    const context = createContext({
      commitItemsChange,
      customFocus: {
        data: {
          node,
          nodes: [node],
        },
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:primary',
      },
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  border-radius: 0;
}`,
      }),
    })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '0',
      property: 'border-radius',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('skips zero length shorthand patches with equivalent arity', () => {
    const commitItemsChange = vi.fn(() => true)
    const node = createFocusNode({
      computedStyle: {
        margin: '0px',
      },
    })
    const context = createContext({
      commitItemsChange,
      customFocus: {
        data: {
          node,
          nodes: [node],
        },
        itemId: 'html-specimen-1',
        ownerId: 'html-specimen',
        targetId: 'dom:primary',
      },
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  margin: 0;
}`,
      }),
    })

    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '0 0 0 0',
      property: 'margin',
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

    expect(markup).toContain('conflict .primary · 1 node')
    expect(markup).toContain('disabled=""')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '8px',
      property: 'margin',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })

  it('keeps CSS-wide background shorthand fill edits non-editable', () => {
    const commitItemsChange = vi.fn(() => true)
    const context = createContext({
      commitItemsChange,
      item: createHtmlSpecimenItem({
        ...createButtonSpecimenData(),
        css: `.primary {
  background: inherit;
}`,
      }),
    })
    const markup = renderToStaticMarkup(
      <>{HTML_SPECIMEN_CSS_INSPECTOR_PANEL.render(context)}</>,
    )

    expect(markup).toContain('conflict .primary · 1 node')
    expect(markup).toContain('disabled=""')
    expect(changeHtmlSpecimenPreviewTargetCss({
      context,
      nextValue: '#111827',
      property: 'background-color',
    })).toBe(false)
    expect(commitItemsChange).not.toHaveBeenCalled()
  })
})

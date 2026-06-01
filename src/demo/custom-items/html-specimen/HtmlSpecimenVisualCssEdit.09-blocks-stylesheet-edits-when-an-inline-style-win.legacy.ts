import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit
} from './HtmlSpecimenVisualCssEdit'
import {
  createButtonNodes,
  createNode
} from './HtmlSpecimenVisualCssEdit.testSupport'

describe('HtmlSpecimenVisualCssEdit', () => {
  it('blocks stylesheet edits when an inline style wins the property', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: [
        createNode({
          attributes: {
            style: 'color: #ef4444;',
          },
          className: 'primary',
          id: 'primary',
          tagName: 'button',
        }),
      ],
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'inline-style',
      specimen,
    })
  })

  it('allows important stylesheet declarations to beat normal inline styles', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155 !important;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: [
        createNode({
          attributes: {
            style: 'color: #ef4444;',
          },
          className: 'primary',
          id: 'primary',
          tagName: 'button',
        }),
      ],
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      important: true,
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827 !important;')
  })

  it('blocks stylesheet edits when an important inline declaration wins', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155 !important;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: [
        createNode({
          attributes: {
            style: 'color: #ef4444 !important; color: #334155;',
          },
          className: 'primary',
          id: 'primary',
          tagName: 'button',
        }),
      ],
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'inline-style',
      specimen,
    })
  })

  it('adds missing declarations to the most specific matching rule', () => {
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '0 0 0 1px #111827',
        nodeId: 'primary',
        property: 'box-shadow',
      },
      nodes: createButtonNodes(),
      specimen: createButtonSpecimenData(),
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source.selector).toBe('.primary')
    expect(result.source.value).toBe('0 0 0 1px #111827')
    expect(result.affectedNodeIds).toEqual(['primary'])
    expect(result.patch).toMatchObject({
      kind: 'insert-declaration',
      nextValue: '0 0 0 1px #111827',
      property: 'box-shadow',
      selector: '.primary',
    })
    expect(result.patch.kind === 'insert-declaration'
      ? result.patch.replacement
      : '').toBe('  box-shadow: 0 0 0 1px #111827;\n')
    expect(result.serializedCss).toBe(result.specimen.css)
    expect(result.specimen.css).toContain('box-shadow: 0 0 0 1px #111827;')
  })

  it('matches descendant selectors against the indexed DOM ancestry', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.toolbar .primary {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        className: 'toolbar',
        id: 'toolbar',
        path: [0],
        tagName: 'section',
      }),
      createNode({
        className: 'primary',
        id: 'primary',
        path: [0, 0],
        tagName: 'button',
      }),
      createNode({
        className: 'primary',
        id: 'loose',
        path: [1],
        tagName: 'button',
      }),
    ]
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes,
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      selector: '.toolbar .primary',
      value: '#111827',
    })
    expect(applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'loose',
        property: 'color',
      },
      nodes,
      specimen,
    })).toEqual({
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    })
  })
})

import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData,
  createDesignSystemSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
  resolveHtmlSpecimenCssDeclarationSource,
  type HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssEdit'

describe('HtmlSpecimenVisualCssEdit', () => {
  it('patches the winning declaration in the stylesheet', () => {
    const specimen = createButtonSpecimenData()
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'background',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source.selector).toBe('.primary')
    expect(result.affectedNodeIds).toEqual(['primary'])
    expect(result.specimen.css).toContain('background: #111827;')
    expect(result.specimen.html).not.toContain('style=')
    expect(result.verification).toEqual({
      actualValue: '#111827',
      expectedValue: '#111827',
      passed: true,
      property: 'background',
    })
  })

  it('patches shared CSS rules and reports the affected nodes', () => {
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '12px',
        nodeId: 'primary',
        property: 'border-radius',
      },
      nodes: createButtonNodes(),
      specimen: createButtonSpecimenData(),
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source.selector).toBe('.button')
    expect(result.affectedNodeIds).toEqual(['primary', 'secondary', 'danger'])
    expect(result.specimen.css).toContain('border-radius: 12px;')
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
    expect(result.specimen.css).toContain('box-shadow: 0 0 0 1px #111827;')
  })

  it('resolves grouped selector declarations from the rendered node', () => {
    const source = resolveHtmlSpecimenCssDeclarationSource({
      css: createDesignSystemSpecimenData().css,
      nodeId: 'panel',
      nodes: [
        createNode({ className: 'toolbar', id: 'toolbar', tagName: 'section' }),
        createNode({
          className: 'panel controls',
          id: 'panel',
          tagName: 'article',
        }),
      ],
      property: 'border-radius',
    })

    expect(source).toMatchObject({
      affectedNodeIds: ['toolbar', 'panel'],
      property: 'border-radius',
      selector: '.toolbar,\n.panel',
      value: '8px',
    })
  })

  it('returns an unresolved result when no stylesheet rule matches', () => {
    const specimen = createButtonSpecimenData()
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'unknown',
        property: 'background',
      },
      nodes: [createNode({
        className: 'unknown',
        id: 'unknown',
        tagName: 'article',
      })],
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    })
  })
})

function createButtonNodes(): HtmlSpecimenVisualCssNode[] {
  return [
    createNode({
      className: 'button primary',
      id: 'primary',
      tagName: 'button',
    }),
    createNode({
      className: 'button secondary',
      id: 'secondary',
      tagName: 'button',
    }),
    createNode({
      className: 'button danger',
      id: 'danger',
      tagName: 'button',
    }),
  ]
}

function createNode({
  className,
  id,
  tagName,
}: {
  className: string
  id: string
  tagName: string
}): HtmlSpecimenVisualCssNode {
  return {
    attributes: { class: className },
    classList: className.split(' '),
    id,
    tagName,
  }
}

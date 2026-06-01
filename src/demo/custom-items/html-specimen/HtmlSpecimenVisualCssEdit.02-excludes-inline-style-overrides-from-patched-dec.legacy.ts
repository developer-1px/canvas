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
  it('excludes inline style overrides from patched declaration affected nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        className: 'button',
        id: 'primary',
        tagName: 'button',
      }),
      createNode({
        attributes: {
          style: 'color: #ef4444;',
        },
        className: 'button',
        id: 'secondary',
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
      property: 'color',
      selector: '.button',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('reports only nodes where a new declaration would win', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button {
  color: #334155;
}
.danger {
  font-size: 13px;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '18px',
        nodeId: 'primary',
        property: 'font-size',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary', 'secondary'],
      property: 'font-size',
      selector: '.button',
      value: '18px',
    })
    expect(result.patch).toMatchObject({
      kind: 'insert-declaration',
      property: 'font-size',
      selector: '.button',
    })
    expect(result.specimen.css).toContain('font-size: 18px;')
    expect(result.specimen.css).toContain('font-size: 13px;')
  })

  it('excludes inline style overrides from add-rule affected nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        className: 'button',
        id: 'primary',
        tagName: 'button',
      }),
      createNode({
        attributes: {
          style: 'font-size: 13px;',
        },
        className: 'button',
        id: 'secondary',
        tagName: 'button',
      }),
    ]
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '18px',
        nodeId: 'primary',
        property: 'font-size',
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
      property: 'font-size',
      selector: '.button',
      value: '18px',
    })
    expect(result.specimen.css).toContain('font-size: 18px;')
  })

  it('patches the later winning declaration without changing earlier matches', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #ffffff;
}
.primary {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.patch).toMatchObject({
      kind: 'replace-declaration-value',
      previousValue: '#334155',
      ruleIndex: 1,
      selector: '.primary',
    })
    expect(result.specimen.css).toContain('color: #ffffff;')
    expect(result.specimen.css).toContain('color: #111827;')
    expect(result.specimen.css.indexOf('color: #ffffff;')).toBeLessThan(
      result.specimen.css.indexOf('color: #111827;'),
    )
  })

  it('patches important declarations before later non-important declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155 !important;
}
.primary {
  color: #ffffff;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: createButtonNodes(),
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
    expect(result.patch).toMatchObject({
      kind: 'replace-declaration-value',
      previousValue: '#334155',
      ruleIndex: 0,
      selector: '.primary',
    })
    expect(result.specimen.css).toContain('color: #111827 !important;')
    expect(result.specimen.css).toContain('color: #ffffff;')
  })
})

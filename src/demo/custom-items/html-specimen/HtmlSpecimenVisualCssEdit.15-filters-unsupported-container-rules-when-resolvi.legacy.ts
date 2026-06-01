import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
  resolveHtmlSpecimenCssDeclarationSource,
  resolveHtmlSpecimenCssScopedRuleSource
} from './HtmlSpecimenVisualCssEdit'
import {
  createButtonNodes,
  createNode
} from './HtmlSpecimenVisualCssEdit.testSupport'

describe('HtmlSpecimenVisualCssEdit', () => {
  it('filters unsupported container rules when resolving sources', () => {
    const css = `.primary {
  color: #334155;
}
@container (min-width: 99999px) {
  .primary {
    color: #ffffff;
  }
}`

    expect(resolveHtmlSpecimenCssDeclarationSource({
      css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toMatchObject({
      property: 'color',
      selector: '.primary',
      value: '#334155',
    })
    expect(resolveHtmlSpecimenCssScopedRuleSource({
      css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toBeNull()
  })

  it('filters unsupported scope rules when resolving sources', () => {
    const css = `.primary {
  color: #334155;
}
@scope (.dialog) {
  .primary {
    color: #ffffff;
  }
}`

    expect(resolveHtmlSpecimenCssDeclarationSource({
      css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toMatchObject({
      property: 'color',
      selector: '.primary',
      value: '#334155',
    })
    expect(resolveHtmlSpecimenCssScopedRuleSource({
      css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toBeNull()
  })

  it('filters unsupported nested at-rules when resolving sources', () => {
    const css = `.primary {
  color: #334155;
}
@unknown preview-editor {
  .primary {
    color: #ffffff;
  }
}`

    expect(resolveHtmlSpecimenCssDeclarationSource({
      css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toMatchObject({
      property: 'color',
      selector: '.primary',
      value: '#334155',
    })
    expect(resolveHtmlSpecimenCssScopedRuleSource({
      css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toBeNull()
  })

  it('reports only nodes whose scoped declaration wins', () => {
    expect(resolveHtmlSpecimenCssScopedRuleSource({
      css: `@media (min-width: 1px) {
  .button {
    color: #ffffff;
  }
  .danger {
    color: #ef4444;
  }
}`,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toMatchObject({
      affectedNodeIds: ['primary', 'secondary'],
      atRule: '@media (min-width: 1px)',
      property: 'color',
      selector: '.button',
      value: '#ffffff',
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

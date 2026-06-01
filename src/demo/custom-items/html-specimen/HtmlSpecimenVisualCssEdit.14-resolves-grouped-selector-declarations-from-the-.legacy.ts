import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData,
  createDesignSystemSpecimenData
} from './HtmlSpecimenCustomItemModel'
import {
  resolveHtmlSpecimenCssDeclarationSource,
  resolveHtmlSpecimenCssRuleSource,
  resolveHtmlSpecimenCssScopedRuleSource
} from './HtmlSpecimenVisualCssEdit'
import {
  createButtonNodes,
  createNode
} from './HtmlSpecimenVisualCssEdit.testSupport'

describe('HtmlSpecimenVisualCssEdit', () => {
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
      value: '6px',
    })
  })

  it('resolves the best matching rule when a declaration is missing', () => {
    expect(resolveHtmlSpecimenCssRuleSource({
      css: createButtonSpecimenData().css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'box-shadow',
    })).toMatchObject({
      affectedNodeIds: ['primary'],
      ruleIndex: 2,
      selector: '.primary',
      specificity: [0, 1, 0],
    })
    expect(resolveHtmlSpecimenCssRuleSource({
      css: '.card { color: red; }',
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'box-shadow',
    })).toBeNull()
  })

  it('resolves add-rule affected nodes by cascade winner', () => {
    expect(resolveHtmlSpecimenCssRuleSource({
      css: `.button {
  color: #334155;
}
.danger {
  font-size: 13px;
}`,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'font-size',
    })).toMatchObject({
      affectedNodeIds: ['primary', 'secondary'],
      ruleIndex: 0,
      selector: '.button',
      specificity: [0, 1, 0],
    })
  })

  it('resolves scoped at-rule declarations as declaration sources', () => {
    expect(resolveHtmlSpecimenCssDeclarationSource({
      css: `@media (min-width: 1px) {
  .primary {
    background: #2563eb;
  }
}`,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'background-color',
    })).toMatchObject({
      affectedNodeIds: ['primary'],
      atRule: '@media (min-width: 1px)',
      property: 'background',
      selector: '.primary',
      value: '#2563eb',
    })
    expect(resolveHtmlSpecimenCssScopedRuleSource({
      css: `@media (min-width: 1px) {
  .primary {
    background: #2563eb;
  }
}`,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'background-color',
    })).toMatchObject({
      affectedNodeIds: ['primary'],
      atRule: '@media (min-width: 1px)',
      property: 'background',
      selector: '.primary',
      value: '#2563eb',
    })
  })

  it('respects source order between scoped and top-level rules', () => {
    expect(resolveHtmlSpecimenCssDeclarationSource({
      css: `@media (min-width: 1px) {
  .primary {
    color: #ffffff;
  }
}
.primary {
  color: #334155;
}`,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toMatchObject({
      property: 'color',
      selector: '.primary',
      value: '#334155',
    })
  })

  it('filters inactive media rules by viewport when resolving sources', () => {
    const css = `.primary {
  color: #334155;
}
@media (min-width: 1000px) {
  .primary {
    color: #ffffff;
  }
}`
    const mediaContext = {
      viewportHeight: 188,
      viewportWidth: 360,
    }

    expect(resolveHtmlSpecimenCssDeclarationSource({
      css,
      mediaContext,
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
      mediaContext,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toBeNull()
  })

  it('filters inactive media range syntax rules by viewport when resolving sources', () => {
    const css = `.primary {
  color: #334155;
}
@media (width >= 1000px) {
  .primary {
    color: #ffffff;
  }
}`
    const mediaContext = {
      viewportHeight: 188,
      viewportWidth: 360,
    }

    expect(resolveHtmlSpecimenCssDeclarationSource({
      css,
      mediaContext,
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
      mediaContext,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'color',
    })).toBeNull()
  })

  it('filters unknown supports rules when resolving sources', () => {
    const css = `.primary {
  color: #334155;
}
@supports (unknown-preview-editor-property: enabled) {
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
})

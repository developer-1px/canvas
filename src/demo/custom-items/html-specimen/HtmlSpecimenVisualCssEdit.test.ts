import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData,
  createDesignSystemSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
  resolveHtmlSpecimenCssDeclarationSource,
  resolveHtmlSpecimenCssRuleSource,
  resolveHtmlSpecimenCssScopedRuleSource,
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
    expect(result.patch).toMatchObject({
      kind: 'replace-declaration-value',
      nextValue: '#111827',
      previousValue: '#2563eb',
      property: 'background',
      selector: '.primary',
    })
    expect(result.serializedCss).toBe(result.specimen.css)
    expect(result.specimen.css).toContain('background: #111827;')
    expect(result.specimen.html).not.toContain('style=')
    expect(result.verification).toEqual({
      actualValue: '#111827',
      expectedValue: '#111827',
      passed: true,
      property: 'background',
    })
  })

  it('patches the winning background shorthand for visual fill edits', () => {
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'background-color',
      },
      nodes: createButtonNodes(),
      specimen: createButtonSpecimenData(),
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      property: 'background',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.patch).toMatchObject({
      kind: 'replace-declaration-value',
      nextValue: '#111827',
      previousValue: '#2563eb',
      property: 'background',
      selector: '.primary',
    })
    expect(result.specimen.css).toContain('background: #111827;')
    expect(result.specimen.css).not.toContain('background-color: #111827;')
    expect(result.verification).toEqual({
      actualValue: '#111827',
      expectedValue: '#111827',
      passed: true,
      property: 'background-color',
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

  it('patches spacing declarations and reports the affected nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button {
  padding: 12px 18px;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '8px 16px',
        nodeId: 'primary',
        property: 'padding',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary', 'secondary', 'danger'],
      property: 'padding',
      selector: '.button',
      value: '8px 16px',
    })
    expect(result.specimen.css).toContain('padding: 8px 16px;')
  })

  it('patches declarations after CSS strings and functions with separators', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  /* note: ignore ; and } inside comments */
  --asset: url("data:image/svg+xml;utf8,<svg>{}</svg>");
  content: "semi; brace }";
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

    expect(result.source.selector).toBe('.primary')
    expect(result.specimen.css).toContain('color: #111827;')
    expect(result.specimen.css).toContain('/* note: ignore ; and } inside comments */')
    expect(result.specimen.css).toContain('content: "semi; brace }";')
  })

  it('blocks raw edits to token-backed stylesheet declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --brand: #2563eb;
}
.primary {
  background: var(--brand);
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'background',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'token-value',
      specimen,
    })
  })

  it('blocks raw edits that would bypass token-backed shorthand declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --brand: #2563eb;
}
.primary {
  background: var(--brand);
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'background-color',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'token-value',
      specimen,
    })
  })

  it('blocks raw stroke edits that would bypass token-backed border declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --stroke: 1px solid #2563eb;
}
.primary {
  border: var(--stroke);
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'border-color',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'token-value',
      specimen,
    })
  })

  it('blocks shorthand edits when related longhand declarations exist', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  margin-top: 4px;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '8px',
        nodeId: 'primary',
        property: 'margin',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'shorthand-conflict',
      specimen,
    })
  })

  it('blocks border-color edits when side color declarations exist', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  border-top-color: #2563eb;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'border-color',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'shorthand-conflict',
      specimen,
    })
  })

  it('blocks edits to scoped at-rule declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@media (min-width: 1px) {
  .primary {
    color: #ffffff;
  }
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

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'scoped-rule',
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

  it('resolves the best matching rule when a declaration is missing', () => {
    expect(resolveHtmlSpecimenCssRuleSource({
      css: createButtonSpecimenData().css,
      nodeId: 'primary',
      nodes: createButtonNodes(),
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
    })).toBeNull()
  })

  it('resolves scoped at-rule declarations without treating them as patchable rules', () => {
    expect(resolveHtmlSpecimenCssDeclarationSource({
      css: `@media (min-width: 1px) {
  .primary {
    background: #2563eb;
  }
}`,
      nodeId: 'primary',
      nodes: createButtonNodes(),
      property: 'background-color',
    })).toBeNull()
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

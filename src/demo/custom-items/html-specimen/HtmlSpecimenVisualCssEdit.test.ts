import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData,
  createDesignSystemSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
  createHtmlSpecimenShadowPreviewCss,
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

  it('blocks background-color edits that would drop complex background layers', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  background: linear-gradient(#ffffff, #f8fafc), #2563eb;
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
      reason: 'shorthand-conflict',
      specimen,
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

  it('reports only nodes whose winning declaration is patched', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button {
  color: #334155;
}
.danger {
  color: #ef4444;
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
      affectedNodeIds: ['primary', 'secondary'],
      property: 'color',
      selector: '.button',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
    expect(result.specimen.css).toContain('color: #ef4444;')
  })

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

  it('patches single-var token definitions instead of raw token-backed declarations', () => {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: '--brand',
      selector: ':root',
      value: '#111827',
    })
    expect(result.previousSource).toMatchObject({
      property: '--brand',
      value: '#2563eb',
    })
    expect(result.specimen.css).toContain('--brand: #111827;')
    expect(result.specimen.css).toContain('background: var(--brand);')
  })

  it('patches single-var tokens used by safe shorthand declarations', () => {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: '--brand',
      selector: ':root',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('--brand: #111827;')
    expect(result.specimen.css).toContain('background: var(--brand);')
  })

  it('patches token definitions declared in a root selector list', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root, html {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: '--brand',
      selector: ':root, html',
      value: '#111827',
    })
    expect(result.previousSource).toMatchObject({
      property: '--brand',
      value: '#2563eb',
    })
    expect(result.specimen.css).toContain('--brand: #111827;')
    expect(result.specimen.css).toContain('background: var(--brand);')
  })

  it('patches existing token definitions when var has a fallback', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --brand: #2563eb;
}
.primary {
  background: var(--brand, rgb(37, 99, 235));
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: '--brand',
      selector: ':root',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('--brand: #111827;')
    expect(result.specimen.css).toContain(
      'background: var(--brand, rgb(37, 99, 235));',
    )
  })

  it('keeps fallback vars read-only when the token definition is missing', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  background: var(--brand, #2563eb);
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

  it('patches inherited token definitions from matching ancestors', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.theme {
  --brand: #2563eb;
}
.button {
  background: var(--brand);
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'background-color',
      },
      nodes: createThemedButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary', 'secondary'],
      property: '--brand',
      selector: '.theme',
      value: '#111827',
    })
    expect(result.previousSource).toMatchObject({
      property: '--brand',
      selector: '.theme',
      value: '#2563eb',
    })
    expect(result.affectedNodeIds).toEqual(['primary', 'secondary'])
    expect(result.specimen.css).toContain('--brand: #111827;')
    expect(result.specimen.css).toContain('background: var(--brand);')
  })

  it('patches the closest inherited token definition', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.theme {
  --brand: #2563eb;
}
.primary {
  --brand: #16a34a;
  background: var(--brand);
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'background-color',
      },
      nodes: createThemedButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: '--brand',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.previousSource).toMatchObject({
      property: '--brand',
      selector: '.primary',
      value: '#16a34a',
    })
    expect(result.specimen.css).toContain('--brand: #2563eb;')
    expect(result.specimen.css).toContain('--brand: #111827;')
  })

  it('bridges root custom properties into the Shadow DOM preview surface', () => {
    const css = [
      ':root, html {',
      '  --brand: #2563eb;',
      '}',
      '@media (max-width: 400px) {',
      '  html {',
      '    --brand: #0f172a;',
      '  }',
      '}',
      '.primary {',
      '  background: var(--brand);',
      '}',
    ].join('\n')

    expect(createHtmlSpecimenShadowPreviewCss({
      css,
      mediaContext: {
        viewportHeight: 240,
        viewportWidth: 800,
      },
    })).toContain([
      ':host, [data-preview-surface-root] {',
      '  --brand: #2563eb;',
      '}',
    ].join('\n'))
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

  it('blocks raw font-size edits that would bypass token-backed font declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --control-font: 700 14px/1 system-ui;
}
.primary {
  font: var(--control-font);
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

    expect(result).toEqual({
      affectedNodeIds: ['primary'],
      ok: false,
      reason: 'token-value',
      specimen,
    })
  })

  it('does not block font-size edits when a longhand beats a token font', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --control-font: 700 14px/1 system-ui;
}
.button {
  font: var(--control-font);
}
.danger {
  font-size: 13px;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '18px',
        nodeId: 'danger',
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
      affectedNodeIds: ['danger'],
      property: 'font-size',
      selector: '.danger',
      value: '18px',
    })
    expect(result.specimen.css).toContain('font-size: 18px;')
  })

  it('reports token affected nodes by related property winner', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:root {
  --control-font: 700 14px/1 system-ui;
}
.button {
  font: var(--control-font);
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

    expect(result).toEqual({
      affectedNodeIds: ['primary', 'secondary'],
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

  it('allows shorthand edits when the shorthand beats earlier longhands', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  margin-top: 4px;
  margin: 8px;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '12px',
        nodeId: 'primary',
        property: 'margin',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: 'margin',
      selector: '.primary',
      value: '12px',
    })
    expect(result.specimen.css).toContain('margin-top: 4px;')
    expect(result.specimen.css).toContain('margin: 12px;')
  })

  it('blocks shorthand edits when a later longhand beats the shorthand', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  margin: 8px;
  margin-top: 4px;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '12px',
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

  it('patches scoped at-rule declarations', () => {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      atRule: '@media (min-width: 1px)',
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('ignores inactive media declarations when choosing the patch source', () => {
    const specimen = {
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
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain('color: #111827;')
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('ignores unsupported container declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@container (min-width: 99999px) {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('ignores unsupported scope declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@scope (.dialog) {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('ignores unsupported nested at-rule declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@unknown preview-editor {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('patches the active rule when inactive media declarations come first', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@media (min-width: 1000px) {
  .primary {
    color: #ffffff;
  }
}
.primary {
  color: #334155;
}`,
      viewportWidth: 360,
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
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain('color: #ffffff;')
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
  })

  it('ignores inactive media range syntax declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@media (width >= 1000px) {
  .primary {
    color: #ffffff;
  }
}`,
      viewportWidth: 360,
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
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('patches active media range syntax declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@media (width >= 1px) {
  .primary {
    color: #ffffff;
  }
}`,
      viewportWidth: 360,
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
      affectedNodeIds: ['primary'],
      atRule: '@media (width >= 1px)',
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('patches active chained media range syntax declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@media (320px <= width < 768px) {
  .primary {
    color: #ffffff;
  }
}`,
      viewportWidth: 360,
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
      affectedNodeIds: ['primary'],
      atRule: '@media (320px <= width < 768px)',
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('ignores unsupported media feature declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@media (prefers-color-scheme: dark) {
  .primary {
    color: #ffffff;
  }
}`,
      viewportWidth: 360,
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
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('ignores inactive supports declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@supports not (display: block) {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('ignores unknown supports declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@supports (unknown-preview-editor-property: enabled) {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain('color: #ffffff;')
  })

  it('patches active known supports declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@supports (display: grid) {
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      atRule: '@supports (display: grid)',
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('lets unlayered normal declarations beat later layered declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}

@layer components {
  .primary {
    color: #ef4444;
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain(`@layer components {
  .primary {
    color: #ef4444;
  }
}`)
  })

  it('respects declared layer order before specificity and source order', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@layer base, components;

@layer components {
  .primary {
    color: #334155;
  }
}

@layer base {
  .primary {
    color: #ef4444;
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

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      atRule: '@layer components',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain(`@layer components {
  .primary {
    color: #111827;
  }
}`)
    expect(result.specimen.css).toContain(`@layer base {
  .primary {
    color: #ef4444;
  }
}`)
  })

  it('lets layered important declarations beat unlayered important declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@layer components {
  .primary {
    color: #334155 !important;
  }
}

.primary {
  color: #ef4444 !important;
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
      affectedNodeIds: ['primary'],
      atRule: '@layer components',
      important: true,
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain(`@layer components {
  .primary {
    color: #111827 !important;
  }
}`)
    expect(result.specimen.css).toContain(`.primary {
  color: #ef4444 !important;
}`)
  })

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

  it('matches adjacent sibling selectors against indexed DOM paths', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.item + .item {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        className: 'item',
        id: 'first',
        path: [0, 0],
        tagName: 'button',
      }),
      createNode({
        className: 'item',
        id: 'second',
        path: [0, 1],
        tagName: 'button',
      }),
      createNode({
        className: 'item',
        id: 'loose',
        path: [1, 0],
        tagName: 'button',
      }),
    ]
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'second',
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
      affectedNodeIds: ['second'],
      selector: '.item + .item',
      value: '#111827',
    })
    expect(applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'first',
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

  it('matches exact attribute selectors against indexed node attributes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button[data-state="active"] {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        attributes: { 'data-state': 'active' },
        className: 'button',
        id: 'active',
        path: [0],
        tagName: 'button',
      }),
      createNode({
        attributes: { 'data-state': 'idle' },
        className: 'button',
        id: 'idle',
        path: [1],
        tagName: 'button',
      }),
    ]
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'active',
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
      affectedNodeIds: ['active'],
      selector: '.button[data-state="active"]',
      value: '#111827',
    })
    expect(applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'idle',
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

  it('matches space-separated attribute selector values against indexed node attributes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button[data-state~="active"] {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        attributes: { 'data-state': 'primary active' },
        className: 'button',
        id: 'active',
        path: [0],
        tagName: 'button',
      }),
      createNode({
        attributes: { 'data-state': 'inactive' },
        className: 'button',
        id: 'idle',
        path: [1],
        tagName: 'button',
      }),
    ]
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'active',
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
      affectedNodeIds: ['active'],
      selector: '.button[data-state~="active"]',
      value: '#111827',
    })
    expect(applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'idle',
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

  it('matches escaped utility class selectors against indexed node classes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.w-\\[12px\\] {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'utility',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'w-[12px]',
          id: 'utility',
          path: [0],
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
      affectedNodeIds: ['utility'],
      selector: '.w-\\[12px\\]',
      value: '#111827',
    })
  })

  it('matches where pseudo function selectors against indexed nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `:where(.button).primary {
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

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      selector: ':where(.button).primary',
      specificity: [0, 1, 0],
      value: '#111827',
    })
  })

  it('does not read class selectors from attribute values', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button[data-kind=".primary"] {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary-kind',
        property: 'color',
      },
      nodes: [
        createNode({
          attributes: { 'data-kind': '.primary' },
          className: 'button',
          id: 'primary-kind',
          path: [0],
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
      affectedNodeIds: ['primary-kind'],
      selector: '.button[data-kind=".primary"]',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('does not split selector lists on commas inside attribute values', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button[data-label="Save, now"] {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'save-now',
        property: 'color',
      },
      nodes: [
        createNode({
          attributes: { 'data-label': 'Save, now' },
          className: 'button',
          id: 'save-now',
          path: [0],
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
      affectedNodeIds: ['save-now'],
      selector: '.button[data-label="Save, now"]',
      value: '#111827',
    })
  })

  it('ignores top-level CSS comments when finding rule blocks', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `/* section { not a rule } */
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

    expect(result.source).toMatchObject({
      affectedNodeIds: ['primary'],
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('/* section { not a rule } */')
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('ignores selector comments before matching and patching rule blocks', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.button/* active state */[data-state="active"] {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'active',
        property: 'color',
      },
      nodes: [
        createNode({
          attributes: { 'data-state': 'active' },
          className: 'button',
          id: 'active',
          path: [0],
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
      affectedNodeIds: ['active'],
      selector: '.button[data-state="active"]',
      value: '#111827',
    })
  })

  it('matches not pseudo function selectors against indexed nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary:not(.disabled) {
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
          className: 'primary',
          id: 'primary',
          path: [0],
          tagName: 'button',
        }),
        createNode({
          className: 'primary disabled',
          id: 'disabled',
          path: [1],
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
      affectedNodeIds: ['primary'],
      selector: '.primary:not(.disabled)',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('matches has pseudo function selectors against indexed descendants', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.card:has(.badge) {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'card',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'card',
          id: 'card',
          path: [0],
          tagName: 'article',
        }),
        createNode({
          className: 'badge',
          id: 'badge',
          path: [0, 0],
          tagName: 'span',
        }),
        createNode({
          className: 'card',
          id: 'empty',
          path: [1],
          tagName: 'article',
        }),
      ],
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['card'],
      selector: '.card:has(.badge)',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('matches structural child pseudo classes against indexed nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.table-row:first-child {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'first',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'table-row',
          id: 'first',
          path: [0, 0],
          tagName: 'div',
        }),
        createNode({
          className: 'table-row',
          id: 'second',
          path: [0, 1],
          tagName: 'div',
        }),
      ],
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['first'],
      selector: '.table-row:first-child',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('matches nth-child pseudo classes against indexed nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.table-row:nth-child(2) {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'second',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'table-row',
          id: 'first',
          path: [0, 0],
          tagName: 'div',
        }),
        createNode({
          className: 'table-row',
          id: 'second',
          path: [0, 1],
          tagName: 'div',
        }),
      ],
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['second'],
      selector: '.table-row:nth-child(2)',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('matches nth-of-type pseudo classes against indexed nodes', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.table-row:nth-of-type(2) {
  color: #334155;
}`,
    }
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'second',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'table-row',
          id: 'first',
          path: [0, 0],
          tagName: 'div',
        }),
        createNode({
          className: 'gap',
          id: 'gap',
          path: [0, 1],
          tagName: 'button',
        }),
        createNode({
          className: 'table-row',
          id: 'second',
          path: [0, 2],
          tagName: 'div',
        }),
      ],
      specimen,
    })

    expect(result.ok).toBe(true)

    if (!result.ok) {
      throw new Error(result.reason)
    }

    expect(result.source).toMatchObject({
      affectedNodeIds: ['second'],
      selector: '.table-row:nth-of-type(2)',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('does not match negated pseudo function selectors when the node is excluded', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary:not(.disabled) {
  color: #334155;
}`,
    }

    expect(applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'primary disabled',
          id: 'primary',
          path: [0],
          tagName: 'button',
        }),
      ],
      specimen,
    })).toEqual({
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    })
  })

  it('matches enabled pseudo-class selectors against form state', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary:enabled {
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
          className: 'primary',
          id: 'primary',
          path: [0],
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
      affectedNodeIds: ['primary'],
      selector: '.primary:enabled',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('matches disabled pseudo-class selectors against form state', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary:disabled {
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
          attributes: { disabled: '' },
          className: 'primary',
          id: 'primary',
          path: [0],
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
      affectedNodeIds: ['primary'],
      selector: '.primary:disabled',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('does not simplify unsupported pseudo-class selectors into patchable matches', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary:hover {
  color: #334155;
}`,
    }

    expect(applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'primary',
        property: 'color',
      },
      nodes: [
        createNode({
          className: 'primary',
          id: 'primary',
          path: [0],
          tagName: 'button',
        }),
      ],
      specimen,
    })).toEqual({
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    })
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

function createThemedButtonNodes(): HtmlSpecimenVisualCssNode[] {
  return [
    createNode({
      className: 'theme',
      id: 'theme',
      path: [0],
      tagName: 'section',
    }),
    createNode({
      className: 'button primary',
      id: 'primary',
      path: [0, 0],
      tagName: 'button',
    }),
    createNode({
      className: 'button secondary',
      id: 'secondary',
      path: [0, 1],
      tagName: 'button',
    }),
    createNode({
      className: 'button outside',
      id: 'outside',
      path: [1],
      tagName: 'button',
    }),
  ]
}

function createNode({
  attributes = {},
  className,
  id,
  path,
  tagName,
}: {
  attributes?: Readonly<Record<string, string>>
  className: string
  id: string
  path?: readonly number[]
  tagName: string
}): HtmlSpecimenVisualCssNode {
  return {
    attributes: {
      ...attributes,
      class: className,
      id,
    },
    classList: className.split(' '),
    id,
    path,
    tagName,
  }
}

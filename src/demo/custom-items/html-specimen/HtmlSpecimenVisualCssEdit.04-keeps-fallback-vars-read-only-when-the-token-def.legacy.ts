import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
  createHtmlSpecimenShadowPreviewCss
} from './HtmlSpecimenVisualCssEdit'
import {
  createButtonNodes,
  createThemedButtonNodes
} from './HtmlSpecimenVisualCssEdit.testSupport'

describe('HtmlSpecimenVisualCssEdit', () => {
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
})

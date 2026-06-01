import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit
} from './HtmlSpecimenVisualCssEdit'
import {
  createButtonNodes
} from './HtmlSpecimenVisualCssEdit.testSupport'

describe('HtmlSpecimenVisualCssEdit', () => {
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
})

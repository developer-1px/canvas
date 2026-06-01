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
      previousValue: '#2457c5',
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
      previousValue: '#2457c5',
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

  it('blocks background-color edits that would replace CSS-wide background shorthand', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  background: inherit;
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

  it('blocks unsupported CSS values before patching the stylesheet', () => {
    const specimen = createButtonSpecimenData()
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: 'not-a-size',
        nodeId: 'primary',
        property: 'font-size',
      },
      nodes: createButtonNodes(),
      specimen,
    })

    expect(result).toEqual({
      affectedNodeIds: [],
      ok: false,
      reason: 'unsupported-value',
      specimen,
    })
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
})

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
})

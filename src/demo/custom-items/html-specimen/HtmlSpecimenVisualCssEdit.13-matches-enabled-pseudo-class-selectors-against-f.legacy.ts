import { describe, expect, it } from 'vitest'
import {
  createButtonSpecimenData
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit
} from './HtmlSpecimenVisualCssEdit'
import {
  createNode
} from './HtmlSpecimenVisualCssEdit.testSupport'

describe('HtmlSpecimenVisualCssEdit', () => {
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

  it('matches disabled pseudo-class selectors through fieldset state', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary:disabled {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        attributes: { disabled: '' },
        className: 'group',
        id: 'group',
        path: [0],
        tagName: 'fieldset',
      }),
      createNode({
        className: 'primary',
        id: 'primary',
        path: [0, 0],
        tagName: 'button',
      }),
      createNode({
        className: 'primary',
        id: 'secondary',
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
      selector: '.primary:disabled',
      specificity: [0, 2, 0],
      value: '#111827',
    })
  })

  it('matches checked pseudo-class selectors against form state', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.control:checked + .label {
  color: #334155;
}`,
    }
    const nodes = [
      createNode({
        attributes: { checked: '', type: 'checkbox' },
        className: 'control',
        id: 'checked',
        path: [0, 0],
        tagName: 'input',
      }),
      createNode({
        className: 'label',
        id: 'checked-label',
        path: [0, 1],
        tagName: 'span',
      }),
      createNode({
        attributes: { type: 'checkbox' },
        className: 'control',
        id: 'unchecked',
        path: [0, 2],
        tagName: 'input',
      }),
      createNode({
        className: 'label',
        id: 'unchecked-label',
        path: [0, 3],
        tagName: 'span',
      }),
    ]
    const result = applyHtmlSpecimenVisualCssEdit({
      intent: {
        nextValue: '#111827',
        nodeId: 'checked-label',
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
      affectedNodeIds: ['checked-label'],
      selector: '.control:checked + .label',
      specificity: [0, 3, 0],
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
})

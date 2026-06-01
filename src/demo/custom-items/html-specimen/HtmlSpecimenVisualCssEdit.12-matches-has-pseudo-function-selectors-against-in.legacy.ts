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
  it('matches has pseudo function selectors against indexed descendants', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.card:has(.content .badge) {
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
          className: 'content',
          id: 'content',
          path: [0, 0],
          tagName: 'section',
        }),
        createNode({
          className: 'badge',
          id: 'badge',
          path: [0, 0, 0],
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
      selector: '.card:has(.content .badge)',
      specificity: [0, 3, 0],
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
})

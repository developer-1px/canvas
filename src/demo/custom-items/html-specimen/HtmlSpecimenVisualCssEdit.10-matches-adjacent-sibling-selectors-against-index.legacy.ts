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
})

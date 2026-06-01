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
})

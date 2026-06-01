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
})

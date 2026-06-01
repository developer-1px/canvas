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
})

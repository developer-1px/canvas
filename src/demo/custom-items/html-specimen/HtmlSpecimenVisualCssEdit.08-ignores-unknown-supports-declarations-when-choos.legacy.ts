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
  it('ignores unknown supports declarations when choosing the patch source', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}
@supports (unknown-preview-editor-property: enabled) {
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

  it('patches active known supports declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@supports (display: grid) {
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
      atRule: '@supports (display: grid)',
      property: 'color',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain('color: #111827;')
  })

  it('lets unlayered normal declarations beat later layered declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `.primary {
  color: #334155;
}

@layer components {
  .primary {
    color: #ef4444;
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
      selector: '.primary',
      value: '#111827',
    })
    expect(result.source.atRule).toBeUndefined()
    expect(result.specimen.css).toContain(`.primary {
  color: #111827;
}`)
    expect(result.specimen.css).toContain(`@layer components {
  .primary {
    color: #ef4444;
  }
}`)
  })

  it('respects declared layer order before specificity and source order', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@layer base, components;

@layer components {
  .primary {
    color: #334155;
  }
}

@layer base {
  .primary {
    color: #ef4444;
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
      atRule: '@layer components',
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain(`@layer components {
  .primary {
    color: #111827;
  }
}`)
    expect(result.specimen.css).toContain(`@layer base {
  .primary {
    color: #ef4444;
  }
}`)
  })

  it('lets layered important declarations beat unlayered important declarations', () => {
    const specimen = {
      ...createButtonSpecimenData(),
      css: `@layer components {
  .primary {
    color: #334155 !important;
  }
}

.primary {
  color: #ef4444 !important;
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
      atRule: '@layer components',
      important: true,
      selector: '.primary',
      value: '#111827',
    })
    expect(result.specimen.css).toContain(`@layer components {
  .primary {
    color: #111827 !important;
  }
}`)
    expect(result.specimen.css).toContain(`.primary {
  color: #ef4444 !important;
}`)
  })
})

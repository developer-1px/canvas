import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  createCanvasAppAssembly,
  type CanvasCustomItem,
} from '../../../canvas'
import HTML_SPECIMEN_CUSTOM_ITEM_MODULE from './HtmlSpecimenCustomItemModule'
import {
  createButtonSpecimenData,
  createDesignSystemSpecimenData,
} from './HtmlSpecimenCustomItemModel'

describe('HtmlSpecimenCustomItemModule', () => {
  it('assembles an HTML specimen through the public custom module seam', () => {
    const assembly = createCanvasAppAssembly({
      customItemModules: [HTML_SPECIMEN_CUSTOM_ITEM_MODULE],
      initialItems: [createHtmlSpecimenItem()],
    })
    const created = assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 460, y: 360 },
      moved: false,
      startWorld: { x: 120, y: 80 },
    })

    expect(assembly.customCreationTools.map((tool) => tool.id)).toEqual([
      'html-specimen',
    ])
    expect(created).toMatchObject({
      id: 'html-specimen-1',
      type: 'custom',
      kind: 'html-specimen',
      presentation: 'html-specimen',
      title: 'Design system specimen',
      x: 120,
      y: 80,
      w: 800,
      h: 540,
    })
    expect(
      assembly.customItemValidators['html-specimen'](createHtmlSpecimenItem()),
    ).toBe(true)
    expect(
      assembly.customItemValidators['html-specimen']({
        ...createHtmlSpecimenItem(),
        data: { html: '', css: '', viewportWidth: 360, viewportHeight: 188 },
      }),
    ).toBe(false)
  })

  it('renders a Shadow DOM preview host inside the canvas item', () => {
    const markup = renderToStaticMarkup(
      <svg>
        {HTML_SPECIMEN_CUSTOM_ITEM_MODULE.renderItem({
          item: createHtmlSpecimenItem(),
        })}
      </svg>,
    )

    expect(markup).toContain('class="demo-html-specimen-node"')
    expect(markup).toContain('class="demo-html-specimen-preview"')
    expect(markup).not.toContain('<iframe')
    expect(markup).not.toContain('srcDoc=')
    expect(markup).toContain('Button specimen')
  })

  it('keeps React provenance in the specimen HTML artifact', () => {
    const specimen = createButtonSpecimenData()

    expect(specimen.html).toContain('data-surface-component="Button"')
    expect(specimen.html).toContain(
      'data-surface-source="src/components/Button.tsx"',
    )
    expect(specimen.html).toContain('Create project')
  })

  it('keeps a visible design-system specimen artifact', () => {
    const specimen = createDesignSystemSpecimenData()

    expect(specimen.viewportWidth).toBe(760)
    expect(specimen.viewportHeight).toBe(486)
    expect(specimen.artifact).toMatchObject({
      kind: 'design-system-sample',
      schemaVersion: 1,
    })
    expect(specimen.artifact?.catalog.primitives).toContain('button')
    expect(specimen.artifact?.surface.blocks.map((block) => block.kind)).toEqual([
      'toolbar',
      'form-panel',
      'status-panel',
      'data-table',
    ])
    expect(JSON.stringify(specimen.artifact)).not.toContain('zod-admin-ui')
    expect(specimen.html).toContain(
      'data-surface-component="DesignSystemSpecimen"',
    )
    expect(specimen.html).toContain('data-surface-component="DataTable"')
    expect(specimen.html).toContain('Workspace controls')
    expect(specimen.css).toContain('.table-row')
  })
})

function createHtmlSpecimenItem(): CanvasCustomItem {
  return {
    id: 'html-specimen-1',
    type: 'custom',
    kind: 'html-specimen',
    presentation: 'html-specimen',
    title: 'Button specimen',
    x: 80,
    y: 120,
    w: 380,
    h: 250,
    data: createButtonSpecimenData(),
  }
}

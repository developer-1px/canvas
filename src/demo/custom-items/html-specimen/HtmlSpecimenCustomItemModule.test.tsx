import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  createCanvasAppAssembly,
  type CanvasCustomItem,
} from '../../../canvas'
import HTML_SPECIMEN_CUSTOM_ITEM_MODULE from './HtmlSpecimenCustomItemModule'
import {
  createButtonSpecimenData,
  createInternalAdminAppSpecimenData,
  getHtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import {
  createHtmlSpecimenSeedItem,
  HTML_SPECIMEN_SEED_ITEM_ID,
} from './HtmlSpecimenCustomItemSeed'

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
    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'paste-html-specimen',
    ])
    expect(assembly.textPasteImporters.map((importer) => importer.id)).toEqual([
      'html-specimen',
    ])
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toContain(
      'html-specimen-css',
    )
    expect(created).toMatchObject({
      id: 'html-specimen-1',
      type: 'custom',
      kind: 'html-specimen',
      presentation: 'html-specimen',
      title: 'Internal app preview',
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
    expect(markup).toContain('aria-label="Copy HTML"')
    expect(markup).toContain('aria-label="Copy CSS"')
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

  it('keeps a visible internal admin app specimen artifact', () => {
    const specimen = createInternalAdminAppSpecimenData()

    expect(specimen.viewportWidth).toBe(960)
    expect(specimen.viewportHeight).toBe(620)
    expect(specimen.artifact).toBeUndefined()
    expect(specimen.html).toContain(
      'data-surface-component="CustomerOnboardingAdmin"',
    )
    expect(specimen.html).toContain('data-preview-default-target="true"')
    expect(specimen.html).toContain('Customer onboarding')
    expect(specimen.html).not.toContain('Design system')
    expect(specimen.html).not.toContain('Evidence Map')
    expect(specimen.css).toContain('.queue-panel')
  })

  it('creates the default demo seed from the internal app specimen', () => {
    const seed = createHtmlSpecimenSeedItem()
    const specimen = getHtmlSpecimenData(seed)

    expect(seed).toMatchObject({
      id: HTML_SPECIMEN_SEED_ITEM_ID,
      type: 'custom',
      kind: 'html-specimen',
      presentation: 'html-specimen',
      title: 'Customer onboarding admin',
      x: 48,
      y: 44,
      w: 980,
      h: 660,
    })
    expect(specimen.viewportWidth).toBe(960)
    expect(specimen.viewportHeight).toBe(620)
    expect(specimen.artifact).toBeUndefined()
    expect(specimen.html).toContain(
      'data-surface-component="CustomerOnboardingAdmin"',
    )
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

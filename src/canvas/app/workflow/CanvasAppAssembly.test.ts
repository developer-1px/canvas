import { describe, expect, it } from 'vitest'
import {
  createCanvasDemoSvgComponentPresentationRenderers,
  type CanvasDemoSvgComponentRendererStrategy,
  type CanvasDemoSvgComponentPresentationRenderers,
  type CanvasDemoSvgCustomItemRendererStrategy,
} from '../rendering'
import { createCanvasComponentLibrary } from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  assertCanvasAppAssembly,
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
  type CanvasAppAssembly,
  type CanvasAppCustomCommand,
  type CanvasAppInspectorPanel,
} from './index'

describe('CanvasAppAssembly', () => {
  it('assembles product-specific component library and presentation registry', () => {
    const componentLibrary = createCanvasComponentLibrary({
      templates: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          w: 180,
          h: 96,
          fill: '#fff7ed',
          stroke: '#fb923c',
          accent: '#ea580c',
          presentation: 'risk-card',
        },
      ],
    })
    const renderRisk: CanvasDemoSvgComponentRendererStrategy = ({ item }) =>
      item.title
    const componentPresentationRenderers =
      createCanvasDemoSvgComponentPresentationRenderers({
        'risk-card': renderRisk,
      })
    const renderRiskItem: CanvasDemoSvgCustomItemRendererStrategy = ({ item }) =>
      item.title
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      presentation: 'risk-node',
      renderItem: renderRiskItem,
      validateItem: (item) => item.data.severity === 'high',
      customCommands: [
        {
          id: 'publish',
          label: 'Pub',
          title: 'Publish selection',
          run: () => undefined,
        },
      ],
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: ({ startWorld }) => ({
            title: 'Risk',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            data: { severity: 'high' },
          }),
        },
      ],
      inspectorPanels: [
        {
          id: 'risk-meta',
          render: ({ selection }) => selection.length,
        },
      ],
    })

    const assembly = createCanvasAppAssembly({
      componentLibrary,
      componentPresentationRenderers,
      customItemModules: [riskModule],
      initialItems: [],
    })

    expect(assembly.componentLibrary.getPresentation('risk')).toBe('risk-card')
    expect(assembly.componentPresentationRenderers['risk-card']).toBe(renderRisk)
    expect(assembly.customItemRenderers['risk-node']).toBe(renderRiskItem)
    expect(assembly.customItemValidators.risk({
      id: 'risk-1',
      type: 'custom',
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
      x: 0,
      y: 0,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })).toBe(true)
    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'publish',
    ])
    expect(assembly.customCreationTools.map((tool) => tool.id)).toEqual([
      'risk',
    ])
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'risk-meta',
    ])
    expect(assembly.initialItems).toEqual([])
  })

  it('rejects duplicate command ids across modules and direct input', () => {
    const riskModule = defineRiskModule()

    expect(() =>
      createCanvasAppAssembly({
        customItemModules: [riskModule],
        customCommands: [
          {
            id: 'publish',
            label: 'Pub',
            title: 'Publish risk',
            run: () => undefined,
          },
        ],
      }),
    ).toThrow('Duplicate canvas app assembly custom command: publish')
  })

  it('treats direct component presentation renderers as extensions', () => {
    const renderRisk: CanvasDemoSvgComponentRendererStrategy = ({ item }) =>
      item.title

    const assembly = createCanvasAppAssembly({
      componentPresentationRenderers: {
        'risk-card': renderRisk,
      },
    })

    expect(assembly.componentPresentationRenderers['risk-card']).toBe(renderRisk)
    expect(assembly.componentPresentationRenderers['note-card']).toBeDefined()
  })

  it('rejects component library presentations without renderers', () => {
    const componentLibrary = createCanvasComponentLibrary({
      templates: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          w: 180,
          h: 96,
          fill: '#fff7ed',
          stroke: '#fb923c',
          accent: '#ea580c',
          presentation: 'risk-card',
        },
      ],
    })
    const renderRisk: CanvasDemoSvgComponentRendererStrategy = ({ item }) =>
      item.title

    expect(() =>
      createCanvasAppAssembly({
        componentLibrary,
      }),
    ).toThrow('Missing canvas app component presentation renderer: risk-card')
    expect(
      createCanvasAppAssembly({
        componentLibrary,
        componentPresentationRenderers: {
          'risk-card': renderRisk,
        },
      }).componentPresentationRenderers['risk-card'],
    ).toBe(renderRisk)
  })

  it('rejects direct extension ids outside the app extension id contract', () => {
    expect(() =>
      createCanvasAppAssembly({
        customCommands: [
          {
            id: 'Publish Risk',
            label: 'Pub',
            title: 'Publish risk',
            run: () => undefined,
          },
        ],
      }),
    ).toThrow('Invalid canvas app custom command id: Publish Risk')
  })

  it('validates initial items against assembled custom item validators', () => {
    const riskItem = {
      id: 'risk-1',
      type: 'custom',
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
      x: 0,
      y: 0,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    } as const

    expect(
      createCanvasAppAssembly({
        customItemModules: [defineRiskModule()],
        initialItems: [riskItem],
      }).initialItems,
    ).toEqual([riskItem])

    expect(() =>
      createCanvasAppAssembly({
        customItemModules: [
          defineCanvasAppCustomItemModule({
            id: 'risk',
            presentation: 'risk-node',
            renderItem: () => 'risk',
            validateItem: (item) => item.data.severity === 'low',
          }),
        ],
        initialItems: [riskItem],
      }),
    ).toThrow('Invalid custom canvas item: risk')
  })

  it('rejects direct component presentation renderer keys outside the app extension id contract', () => {
    expect(() =>
      createCanvasAppAssembly({
        componentPresentationRenderers: {
          'Risk Card': () => null,
        },
      }),
    ).toThrow('Invalid canvas app component presentation renderer id: Risk Card')
  })

  it('rejects malformed direct app descriptors at the assembly seam', () => {
    expect(() =>
      createCanvasAppAssembly({
        customCommands: [
          {
            id: 'publish',
            label: 'Pub',
            title: 'Publish risk',
          } as unknown as CanvasAppCustomCommand,
        ],
      }),
    ).toThrow('Canvas app custom command publish requires run')

    expect(() =>
      createCanvasAppAssembly({
        inspectorPanels: [
          {
            id: 'risk-meta',
          } as unknown as CanvasAppInspectorPanel,
        ],
      }),
    ).toThrow('Canvas app inspector panel risk-meta requires render')

    expect(() =>
      createCanvasAppAssembly({
        componentPresentationRenderers: {
          'risk-card': undefined,
        } as unknown as CanvasDemoSvgComponentPresentationRenderers,
      }),
    ).toThrow(
      'Canvas app component presentation renderer risk-card requires render strategy',
    )
  })

  it('validates assembled output before app runtime use', () => {
    const assembly = createCanvasAppAssembly()

    expect(assertCanvasAppAssembly(assembly)).toBe(assembly)
    expect(assertCanvasAppAssembly(DEFAULT_CANVAS_APP_ASSEMBLY)).toBe(
      DEFAULT_CANVAS_APP_ASSEMBLY,
    )

    expect(() =>
      assertCanvasAppAssembly({
        ...assembly,
        componentLibrary: {
          ...assembly.componentLibrary,
          getPresentation: undefined,
        },
      } as unknown as CanvasAppAssembly),
    ).toThrow('Canvas app component library requires getPresentation')

    expect(() =>
      assertCanvasAppAssembly({
        ...assembly,
        customItemValidators: {
          risk: undefined,
        },
      } as unknown as CanvasAppAssembly),
    ).toThrow('Canvas app custom item validator risk requires validate strategy')

    expect(() =>
      assertCanvasAppAssembly({
        ...assembly,
        itemAdapters: {
          ...assembly.itemAdapters,
          command: {
            ...assembly.itemAdapters.command,
            selectAll: undefined,
          },
        },
      } as unknown as CanvasAppAssembly),
    ).toThrow('Canvas app command adapter requires selectAll')
  })

  it('can disable custom item modules at the app assembly seam', () => {
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      presentation: 'risk-node',
      renderItem: () => 'risk',
      validateItem: () => true,
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => null,
        },
      ],
    })

    const assembly = createCanvasAppAssembly({
      customItemModules: [riskModule],
      disabledCustomItemModuleIds: ['risk'],
    })

    expect(assembly.customCreationTools).toEqual([])
    expect(assembly.customItemValidators).toEqual({})
  })

})

function defineRiskModule() {
  return defineCanvasAppCustomItemModule({
    id: 'risk',
    presentation: 'risk-node',
    renderItem: () => 'risk',
    validateItem: () => true,
    customCommands: [
      {
        id: 'publish',
        label: 'Pub',
        title: 'Publish risk',
        run: () => undefined,
      },
    ],
  })
}

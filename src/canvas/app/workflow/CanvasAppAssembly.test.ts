import { describe, expect, it } from 'vitest'
import {
  createCanvasDemoSvgComponentPresentationRenderers,
  createCanvasDemoSvgCustomItemRenderers,
  type CanvasDemoSvgComponentRendererStrategy,
  type CanvasDemoSvgCustomItemRendererStrategy,
} from '../rendering'
import { createCanvasComponentLibrary } from '../../host'
import {
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
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
    const customItemRenderers = createCanvasDemoSvgCustomItemRenderers({
      'risk-node': renderRiskItem,
    })
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
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
          createItem: ({ createId, startWorld }) => ({
            id: createId('risk'),
            type: 'rect',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            fill: '#fff7ed',
            stroke: '#fb923c',
          }),
        },
      ],
      customItemRenderers,
      customItemValidators: {
        risk: (item) => item.presentation === 'risk-node',
      },
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
      data: {},
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

  it('rejects duplicate extension keys across modules and direct input', () => {
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      customItemValidators: {
        risk: () => true,
      },
    })

    expect(() =>
      createCanvasAppAssembly({
        customItemModules: [riskModule],
        customItemValidators: {
          risk: () => false,
        },
      }),
    ).toThrow('Duplicate canvas app assembly custom item validator: risk')
  })

  it('can disable custom item modules at the app assembly seam', () => {
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => null,
        },
      ],
      customItemValidators: {
        risk: () => true,
      },
    })

    const assembly = createCanvasAppAssembly({
      customItemModules: [riskModule],
      disabledCustomItemModuleIds: ['risk'],
    })

    expect(assembly.customCreationTools).toEqual([])
    expect(assembly.customItemValidators).toEqual({})
  })

  it('rejects custom creation tool shortcut conflicts across modules and direct input', () => {
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          shortcut: { key: 'e', shiftKey: true },
          createItem: () => null,
        },
      ],
    })

    expect(() =>
      createCanvasAppAssembly({
        customItemModules: [riskModule],
        customCreationTools: [
          {
            id: 'dependency',
            label: 'D',
            title: 'Dependency',
            shortcut: { key: 'e', shiftKey: true },
            createItem: () => null,
          },
        ],
      }),
    ).toThrow(
      'Duplicate canvas app custom creation tool shortcut: risk and dependency use Shift+E',
    )
  })
})

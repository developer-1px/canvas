import { describe, expect, it } from 'vitest'
import { createCanvasComponentLibrary } from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  assertCanvasAppAssembly,
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
} from './index'
import type {
  CanvasAppAssembly,
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
  CanvasAppCustomCommand,
  CanvasAppInspectorPanel,
  CanvasAppItemLayerAdapter,
  CanvasAppStageAdapter,
  CanvasWorkspaceStorageProvider,
} from './index'

describe('CanvasAppAssembly validation', () => {
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
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
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


  it('rejects malformed workspace storage providers', () => {
    expect(() =>
      createCanvasAppAssembly({
        workspaceStorageProvider:
          {} as unknown as CanvasWorkspaceStorageProvider,
      }),
    ).toThrow('Canvas app assembly requires workspaceStorageProvider')
  })


  it('rejects initial selection ids outside assembled initial items', () => {
    expect(() =>
      createCanvasAppAssembly({
        initialItems: [{
          fill: '#ffffff',
          h: 40,
          id: 'rect-1',
          stroke: '#111111',
          type: 'rect',
          w: 80,
          x: 0,
          y: 0,
        }],
        initialSelection: ['missing'],
      }),
    ).toThrow('Invalid assembly initial selection: missing')
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
        affordanceConfig: {
          tools: { marker: 'off' },
        },
      } as unknown as Parameters<typeof createCanvasAppAssembly>[0]),
    ).toThrow('Canvas affordance config tools.marker must be boolean')

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
        } as unknown as CanvasAppComponentPresentationRenderers,
      }),
    ).toThrow(
      'Canvas app component presentation renderer risk-card requires render strategy',
    )

    expect(() =>
      createCanvasAppAssembly({
        itemLayerAdapter: {} as unknown as CanvasAppItemLayerAdapter,
      }),
    ).toThrow('Canvas app item layer adapter requires renderItems')

    expect(() =>
      createCanvasAppAssembly({
        stageAdapter: {} as unknown as CanvasAppStageAdapter,
      }),
    ).toThrow('Canvas app stage adapter requires renderStage')
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
        componentLibrary: {
          ...assembly.componentLibrary,
          getPresentation: () => 'mutated-card',
        },
      } as unknown as CanvasAppAssembly),
    ).toThrow('Canvas app component library getPresentation mismatch: sticky')

    expect(() =>
      assertCanvasAppAssembly({
        ...assembly,
        componentLibrary: {
          ...assembly.componentLibrary,
          getTemplate: () => ({
            ...assembly.componentLibrary.templates[0],
            presentation: 'mutated-card',
          }),
        },
      } as unknown as CanvasAppAssembly),
    ).toThrow('Canvas app component library getTemplate mismatch: sticky')

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
        initialSelection: ['missing'],
      } as unknown as CanvasAppAssembly),
    ).toThrow('Invalid assembly initial selection: missing')

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


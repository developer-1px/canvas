import { describe, expect, it } from 'vitest'
import { createCanvasComponentLibrary } from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  assertCanvasAppAssembly,
  createCanvasAppAssembly,
  createCanvasAppComponentPresentationRenderers,
  defineCanvasAppCustomItemModule,
  type CanvasAppAssembly,
  type CanvasAppComponentPresentationRenderers,
  type CanvasAppComponentRendererStrategy,
  type CanvasAppCustomCommand,
  type CanvasAppCustomItemModuleCreationTool,
  type CanvasAppCustomItemRendererStrategy,
  type CanvasAppInspectorPanel,
  type CanvasAppItemLayerAdapter,
  type CanvasAppStageAdapter,
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
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title
    const componentPresentationRenderers =
      createCanvasAppComponentPresentationRenderers({
        'risk-card': renderRisk,
      })
    const renderRiskItem: CanvasAppCustomItemRendererStrategy = ({ item }) =>
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
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
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

  it('accepts rendering adapters at the app assembly seam', () => {
    const itemLayerAdapter: CanvasAppItemLayerAdapter = {
      renderItems: ({ items }) => items.length,
    }
    const stageAdapter: CanvasAppStageAdapter = {
      renderStage: ({ children }) => children,
    }

    const assembly = createCanvasAppAssembly({
      itemLayerAdapter,
      stageAdapter,
    })

    expect(assembly.itemLayerAdapter.renderItems(
      createItemLayerInput({ items: DEFAULT_CANVAS_APP_ASSEMBLY.initialItems }),
    )).toBe(DEFAULT_CANVAS_APP_ASSEMBLY.initialItems.length)
    expect(assembly.stageAdapter.renderStage).toBe(stageAdapter.renderStage)
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

  it('snapshots assembled output against caller mutation', () => {
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title
    const renderMutatedRisk: CanvasAppComponentRendererStrategy = () =>
      'mutated'
    const componentPresentationRenderers = {
      'risk-card': renderRisk,
    }
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
    const customCommandRun = () => undefined
    const customCommand = {
      id: 'publish',
      label: 'Pub',
      title: 'Publish risk',
      run: customCommandRun,
    }
    const customInspectorPanel: CanvasAppInspectorPanel = {
      id: 'risk-meta',
      render: ({ selection }) => selection.length,
    }
    const initialItems = [
      {
        id: 'rect-1',
        type: 'rect',
        x: 0,
        y: 0,
        w: 120,
        h: 80,
        fill: '#fff',
        stroke: '#000',
      },
    ] satisfies CanvasAppAssembly['initialItems']
    const itemAdapters = {
      ...DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
      command: {
        ...DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters.command,
      },
    }
    const itemLayerRenderItems = ({ items }: Parameters<
      CanvasAppItemLayerAdapter['renderItems']
    >[0]) => items.length
    const itemLayerAdapter: CanvasAppItemLayerAdapter = {
      renderItems: itemLayerRenderItems,
    }
    const renderStage: CanvasAppStageAdapter['renderStage'] = ({ children }) =>
      children
    const stageAdapter: CanvasAppStageAdapter = {
      renderStage,
    }
    const moduleCreationTool: CanvasAppCustomItemModuleCreationTool = {
      id: 'risk',
      label: '!',
      title: 'Risk',
      shortcut: { key: 'e', shiftKey: true },
      createItem: ({ startWorld }) => ({
        title: 'Risk',
        x: startWorld.x,
        y: startWorld.y,
        w: 120,
        h: 80,
        data: { severity: 'high' },
      }),
    }
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      presentation: 'risk-node',
      renderItem: ({ item }) => item.title,
      validateItem: (item) => item.data.severity === 'high',
      customCreationTools: [moduleCreationTool],
    })

    const assembly = createCanvasAppAssembly({
      componentLibrary,
      componentPresentationRenderers,
      customCommands: [customCommand],
      customItemModules: [riskModule],
      initialItems,
      inspectorPanels: [customInspectorPanel],
      itemAdapters,
      itemLayerAdapter,
      stageAdapter,
    })

    componentLibrary.getPresentation = () => 'mutated-card'
    componentLibrary.getTemplate = () => ({
      ...componentLibrary.templates[0],
      title: 'Mutated risk',
    })
    componentPresentationRenderers['risk-card'] = renderMutatedRisk
    customCommand.title = 'Mutated publish'
    customCommand.run = () => {
      throw new Error('mutated command')
    }
    customInspectorPanel.render = () => 'mutated'
    initialItems[0].x = 999
    initialItems.push({
      ...initialItems[0],
      id: 'rect-2',
    })
    itemAdapters.command.selectAll = () => ['mutated']
    itemLayerAdapter.renderItems = () => 'mutated'
    stageAdapter.renderStage = () => 'mutated'
    moduleCreationTool.createItem = ({ startWorld }) => ({
      title: 'Mutated risk',
      x: startWorld.x,
      y: startWorld.y,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })

    expect(assembly.componentLibrary.getPresentation('risk')).toBe('risk-card')
    expect(assembly.componentLibrary.getTemplate('risk')).toMatchObject({
      id: 'risk',
      title: 'Risk',
    })
    expect(assembly.componentPresentationRenderers['risk-card']).toBe(
      renderRisk,
    )
    expect(assembly.customCommands[0]).toMatchObject({
      id: 'publish',
      title: 'Publish risk',
    })
    expect(assembly.customCommands[0]?.run).toBe(customCommandRun)
    expect(assembly.inspectorPanels[0]?.render({
      bounds: null,
      commitItemsChange: () => false,
      disabled: false,
      label: null,
      selectedItems: [],
      selection: ['risk-1'],
    })).toBe(1)
    expect(assembly.initialItems).toHaveLength(1)
    expect(assembly.initialItems[0]).toMatchObject({ id: 'rect-1', x: 0 })
    expect(assembly.itemAdapters.command.selectAll({ items: [] })).toEqual([])
    expect(assembly.itemLayerAdapter.renderItems(
      createItemLayerInput({ items: assembly.initialItems }),
    )).toBe(1)
    expect(assembly.itemLayerAdapter.renderItems).toBe(itemLayerRenderItems)
    expect(assembly.stageAdapter.renderStage).toBe(renderStage)
    expect(assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 10, y: 20 },
      moved: false,
      startWorld: { x: 10, y: 20 },
    })).toMatchObject({
      kind: 'risk',
      title: 'Risk',
    })
    expect(Object.isFrozen(assembly)).toBe(true)
    expect(Object.isFrozen(assembly.componentLibrary)).toBe(true)
    expect(Object.isFrozen(assembly.componentLibrary.templates)).toBe(true)
    expect(Object.isFrozen(assembly.componentLibrary.templates[0])).toBe(true)
    expect(Object.isFrozen(assembly.customCommands)).toBe(true)
    expect(Object.isFrozen(assembly.customCommands[0])).toBe(true)
    expect(Object.isFrozen(assembly.customCreationTools[0]?.shortcut)).toBe(true)
    expect(Object.isFrozen(assembly.componentPresentationRenderers)).toBe(true)
    expect(Object.isFrozen(assembly.customItemValidators)).toBe(true)
    expect(Object.isFrozen(assembly.initialItems)).toBe(true)
    expect(Object.isFrozen(assembly.initialItems[0])).toBe(true)
    expect(Object.isFrozen(assembly.itemAdapters.command)).toBe(true)
    expect(Object.isFrozen(assembly.itemLayerAdapter)).toBe(true)
    expect(Object.isFrozen(assembly.stageAdapter)).toBe(true)
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

function createItemLayerInput(
  input: Partial<
    Parameters<CanvasAppItemLayerAdapter['renderItems']>[0]
  > = {},
): Parameters<CanvasAppItemLayerAdapter['renderItems']>[0] {
  return {
    componentPresentationRenderers: {},
    customItemRenderers: {},
    getComponentPresentation: () => 'note-card',
    items: [],
    onItemPointerDown: () => undefined,
    onTextDoubleClick: () => undefined,
    outlineIds: new Set(),
    selected: new Set(),
    ...input,
  }
}

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

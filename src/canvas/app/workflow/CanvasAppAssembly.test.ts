import { describe, expect, it } from 'vitest'
import { createCanvasComponentLibrary } from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  createCanvasAppAssembly,
  createCanvasAppComponentPresentationRenderers,
  defineCanvasAppCustomItemModule,
} from './index'
import type {
  CanvasAppComponentRendererStrategy,
  CanvasAppCustomItemRendererStrategy,
	  CanvasAppItemLayerAdapter,
	  CanvasAppPresenceProvider,
	  CanvasAppStageAdapter,
	  CanvasMediaImporter,
	  CanvasWorkspaceStorageProvider,
} from './index'

describe('CanvasAppAssembly seams', () => {
  it('assembles product affordance config at the app assembly seam', () => {
    const assembly = createCanvasAppAssembly({
      affordanceConfig: {
        commands: { duplicate: false },
        gestures: { drawMarker: false },
        overlays: { grid: false },
        shortcuts: { markerTool: false },
        tools: { marker: false },
      },
    })

    expect(assembly.affordanceConfig.commands.duplicate).toBe(false)
    expect(assembly.affordanceConfig.gestures.drawMarker).toBe(false)
    expect(assembly.affordanceConfig.overlays.grid).toBe(false)
    expect(assembly.affordanceConfig.shortcuts.markerTool).toBe(false)
    expect(assembly.affordanceConfig.tools.marker).toBe(false)
    expect(assembly.affordanceConfig.tools.select).toBe(true)
  })


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
    const mediaImporter: CanvasMediaImporter = {
      id: 'risk-media',
      createItems: () => [],
    }
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
      mediaImporters: [mediaImporter],
      textPasteImporters: [{
        id: 'risk-paste',
        createItems: () => [],
      }],
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
    expect(assembly.textPasteImporters.map((importer) => importer.id)).toEqual([
      'risk-paste',
    ])
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'link-preview-actions',
      'arrow-routing-actions',
      'checklist-actions',
      'kanban-actions',
      'risk-meta',
    ])
    expect(assembly.mediaImporters.map((importer) => importer.id)).toEqual([
      'risk-media',
    ])
    expect(assembly.initialItems).toEqual([])
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


  it('accepts workspace storage provider at the app assembly seam', () => {
    const workspaceStorageProvider: CanvasWorkspaceStorageProvider = () => null

    const assembly = createCanvasAppAssembly({
      workspaceStorageProvider,
    })

    expect(assembly.workspaceStorageProvider).toBe(workspaceStorageProvider)
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.workspaceStorageProvider()).toBeNull()
  })

  it('accepts live presence providers at the app assembly seam', () => {
    const presenceProvider: CanvasAppPresenceProvider = ({
      selection,
      viewport,
    }) => [{
      color: '#2563eb',
      id: 'remote-mia',
      label: `${selection[0] ?? 'none'}:${viewport.scale}`,
      point: { x: 10, y: 20 },
      selectionBounds: { h: 40, w: 80, x: 5, y: 6 },
    }]

    const assembly = createCanvasAppAssembly({
      presenceProvider,
    })

    expect(assembly.presenceProvider({
      selection: ['rect-1'],
      viewport: { scale: 2, x: 0, y: 0 },
    })).toEqual([{
      color: '#2563eb',
      id: 'remote-mia',
      label: 'rect-1:2',
      point: { x: 10, y: 20 },
      selectionBounds: { h: 40, w: 80, x: 5, y: 6 },
    }])
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.presenceProvider({
      selection: [],
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual([])
  })

  it('keeps demo default selection inside the default assembly only', () => {
    const customInitialItems = [{
      fill: '#ffffff',
      h: 40,
      id: 'rect-1',
      stroke: '#111111',
      type: 'rect',
      w: 80,
      x: 0,
      y: 0,
    }] as const

    expect(DEFAULT_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([
      'component-sticky',
      'component-card',
    ])
    expect(createCanvasAppAssembly({
      initialItems: [...customInitialItems],
    }).initialSelection).toEqual([])
    expect(createCanvasAppAssembly({
      initialItems: [...customInitialItems],
      initialSelection: ['rect-1'],
    }).initialSelection).toEqual(['rect-1'])
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
    onArrowEndpointPointerDown: () => undefined,
    onItemPointerDown: () => undefined,
    onTextDoubleClick: () => undefined,
    outlineIds: new Set(),
    selected: new Set(),
    ...input,
  }
}

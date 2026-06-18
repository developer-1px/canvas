import { describe, expect, it } from 'vitest'
import { defineCanvasExtension } from '../../foundation'
import { createCanvasComponentLibrary } from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
} from './index'
import type { CanvasAffordanceConfigInput } from '../../engine'
import type {
  CanvasAppAssembly,
  CanvasAppCapabilityInput,
  CanvasAppComponentRendererStrategy,
  CanvasAppCustomItemModuleCreationTool,
  CanvasAppFoundationExtension,
  CanvasAppInspectorPanel,
  CanvasAppItemLayerAdapter,
  CanvasAppPresenceProvider,
  CanvasAppStageAdapter,
  CanvasMediaImporter,
  CanvasTextPasteImporter,
} from './index'

describe('CanvasAppAssembly snapshots', () => {
  it('snapshots assembled output against caller mutation', () => {
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title
    const renderMutatedRisk: CanvasAppComponentRendererStrategy = () =>
      'mutated'
    const renderStatus = () => null
    const renderMutatedStatus = () => null
    const componentPresentationRenderers = {
      'risk-card': renderRisk,
    }
    const featurePackViewRenderers = {
      status: renderStatus,
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
    const componentDefinitions = [{
      id: 'risk-card',
      instances: [
        {
          label: 'Primary',
          slots: {
            root: 'risk-card-primary',
            title: 'risk-card-primary-title',
          },
        },
      ],
      label: 'Risk card',
    }]
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
    const textPasteImporter: CanvasTextPasteImporter = {
      id: 'risk-paste',
      createItems: () => null,
    }
    const mediaImporter: CanvasMediaImporter = {
      id: 'risk-media',
      createItems: () => null,
    }
    const foundationExtension: CanvasAppFoundationExtension =
      defineCanvasExtension({
      id: 'canvas.risk',
      requiredAdapters: ['document'],
      rendererSlots: [{
        id: 'canvas.risk.renderer',
        surface: 'item-layer',
      }],
      tools: [{
        id: 'canvas.risk.tool',
        kind: 'creation',
        requiredAdapters: ['creation'],
      }],
    })
    const presenceProvider: CanvasAppPresenceProvider = () => [{
      color: '#2563eb',
      id: 'remote-mia',
      label: 'Mia',
      point: { x: 10, y: 20 },
    }]
    const capabilities: CanvasAppCapabilityInput = {
      editDocument: false,
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
    const affordanceTools: NonNullable<
      CanvasAffordanceConfigInput['tools']
    > = { marker: false }
    const affordanceConfig: CanvasAffordanceConfigInput = {
      tools: affordanceTools,
    }
    const moduleCreationTool: CanvasAppCustomItemModuleCreationTool = {
      id: 'risk',
      label: '!',
      title: 'Risk',
      shortcut: { key: 'k', shiftKey: true },
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
      affordanceConfig,
      capabilities,
      componentDefinitions,
      componentLibrary,
      componentPresentationRenderers,
      customCommands: [customCommand],
      featurePackViewRenderers,
      foundationExtensions: [foundationExtension],
      customItemModules: [riskModule],
      initialItems,
      initialSelection: ['rect-1'],
      inspectorPanels: [customInspectorPanel],
      itemAdapters,
      itemLayerAdapter,
      mediaImporters: [mediaImporter],
      presenceProvider,
      stageAdapter,
      textPasteImporters: [textPasteImporter],
    })

    capabilities.editDocument = true
    componentDefinitions.push({
      ...componentDefinitions[0],
      id: 'mutated-card',
    })
    componentDefinitions[0].instances[0].slots.root = 'mutated-root'
    componentLibrary.getPresentation = () => 'mutated-card'
    componentLibrary.getTemplate = () => ({
      ...componentLibrary.templates[0],
      title: 'Mutated risk',
    })
    componentPresentationRenderers['risk-card'] = renderMutatedRisk
    featurePackViewRenderers.status = renderMutatedStatus
    customCommand.title = 'Mutated publish'
    customCommand.run = () => {
      throw new Error('mutated command')
    }
    foundationExtension.requiredAdapters = ['renderer']
    foundationExtension.tools = []
    customInspectorPanel.render = () => 'mutated'
    mediaImporter.createItems = () => []
    textPasteImporter.createItems = () => []
    initialItems[0].x = 999
    initialItems.push({
      ...initialItems[0],
      id: 'rect-2',
    })
    itemAdapters.command.selectAll = () => ['mutated']
    itemLayerAdapter.renderItems = () => 'mutated'
    stageAdapter.renderStage = () => 'mutated'
    affordanceTools.marker = true
    moduleCreationTool.createItem = ({ startWorld }) => ({
      title: 'Mutated risk',
      x: startWorld.x,
      y: startWorld.y,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })

    expect(assembly.affordanceConfig.tools.marker).toBe(false)
    expect(assembly.capabilities.editDocument).toBe(false)
    expect(assembly.componentDefinitionRegistry.definitions.map(
      (definition) => definition.id,
    )).toEqual(['risk-card'])
    expect(assembly.componentDefinitionRegistry.getBinding(
      'risk-card-primary',
    )?.currentItemId).toBe('risk-card-primary')
    expect(assembly.componentLibrary.getPresentation('risk')).toBe('risk-card')
    expect(assembly.componentLibrary.getTemplate('risk')).toMatchObject({
      id: 'risk',
      title: 'Risk',
    })
    expect(assembly.componentPresentationRenderers['risk-card']).toBe(
      renderRisk,
    )
    expect(assembly.featurePackViewRenderers.status).toBe(renderStatus)
    expect(assembly.customCommands[0]).toMatchObject({
      id: 'publish',
      title: 'Publish risk',
    })
    expect(assembly.customCommands[0]?.run).toBe(customCommandRun)
    const riskFoundationExtension = assembly.foundationExtensions.find(
      (extension) => extension.id === 'canvas.risk',
    )

    expect(riskFoundationExtension?.requiredAdapters).toEqual([
      'document',
    ])
    expect(riskFoundationExtension?.tools?.[0]?.requiredAdapters).toEqual([
      'creation',
    ])
    expect(assembly.mediaImporters[0]?.createItems({} as never)).toBeNull()
    expect(assembly.textPasteImporters[0]?.createItems({} as never)).toBeNull()
    expect(assembly.inspectorPanels.find((panel) =>
      panel.id === 'risk-meta'
    )?.render({
      bounds: null,
      commitItemsChange: () => false,
      disabled: false,
      label: null,
      selectedItems: [],
      selection: ['risk-1'],
    })).toBe(1)
    expect(assembly.initialItems).toHaveLength(1)
    expect(assembly.initialItems[0]).toMatchObject({ id: 'rect-1', x: 0 })
    expect(assembly.initialSelection).toEqual(['rect-1'])
    expect(assembly.itemAdapters.command.selectAll({ items: [] })).toEqual([])
    expect(assembly.presenceProvider({
      selection: [],
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual([{
      color: '#2563eb',
      id: 'remote-mia',
      label: 'Mia',
      point: { x: 10, y: 20 },
    }])
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
    expect(Object.isFrozen(assembly.affordanceConfig)).toBe(true)
    expect(Object.isFrozen(assembly.affordanceConfig.commands)).toBe(true)
    expect(Object.isFrozen(assembly.affordanceConfig.tools)).toBe(true)
    expect(Object.isFrozen(assembly.capabilities)).toBe(true)
    expect(Object.isFrozen(assembly.componentDefinitionRegistry)).toBe(true)
    expect(Object.isFrozen(
      assembly.componentDefinitionRegistry.definitions,
    )).toBe(true)
    expect(Object.isFrozen(assembly.componentLibrary)).toBe(true)
    expect(Object.isFrozen(assembly.componentLibrary.templates)).toBe(true)
    expect(Object.isFrozen(assembly.componentLibrary.templates[0])).toBe(true)
    expect(Object.isFrozen(assembly.customCommands)).toBe(true)
    expect(Object.isFrozen(assembly.customCommands[0])).toBe(true)
    expect(Object.isFrozen(assembly.customCreationTools[0]?.shortcut)).toBe(true)
    expect(Object.isFrozen(riskFoundationExtension)).toBe(true)
    expect(Object.isFrozen(riskFoundationExtension?.tools?.[0])).toBe(true)
    expect(Object.isFrozen(assembly.mediaImporters[0])).toBe(true)
    expect(Object.isFrozen(assembly.componentPresentationRenderers)).toBe(true)
    expect(Object.isFrozen(assembly.customItemValidators)).toBe(true)
    expect(Object.isFrozen(assembly.installedFeaturePackIds)).toBe(true)
    expect(Object.isFrozen(assembly.initialItems)).toBe(true)
    expect(Object.isFrozen(assembly.initialItems[0])).toBe(true)
    expect(Object.isFrozen(assembly.initialSelection)).toBe(true)
    expect(Object.isFrozen(assembly.itemAdapters.command)).toBe(true)
    expect(Object.isFrozen(assembly.itemLayerAdapter)).toBe(true)
    expect(Object.isFrozen(assembly.stageAdapter)).toBe(true)
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
